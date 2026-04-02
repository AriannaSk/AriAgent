using AutoMapper;
using db.Data;
using db.DTOs;
using db.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace db.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  [Authorize]
  public class BillingInputsController : ControllerBase
  {
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public BillingInputsController(AppDbContext context, IMapper mapper)
    {
      _context = context;
      _mapper = mapper;
    }

    // 🔥 ДОБАВЛЕНО — теперь manager не будет падать
    [Authorize(Roles = "Manager")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BillingInputReadDto>>> GetAll()
    {
      var items = await _context.BillingInputs.ToListAsync();
      return Ok(_mapper.Map<IEnumerable<BillingInputReadDto>>(items));
    }

    [Authorize(Roles = "Resident,Manager")]
    [HttpGet("{apartmentId:guid}/{period}")]
    public async Task<ActionResult<BillingInputReadDto>> GetByApartmentAndPeriod(Guid apartmentId, string period)
    {
      var item = await _context.BillingInputs
          .FirstOrDefaultAsync(x => x.ApartmentId == apartmentId && x.Period == period);

      if (item == null)
        return NotFound();

      return Ok(_mapper.Map<BillingInputReadDto>(item));
    }

    [Authorize(Roles = "Resident,Manager")]
    [HttpPost("save")]
    public async Task<ActionResult> Save([FromBody] BillingInputSaveDto dto)
    {
      var apartment = await _context.Dzivokli
          .FirstOrDefaultAsync(x => x.Id == dto.ApartmentId);

      if (apartment == null)
        return NotFound("Apartment not found.");

      var services = await _context.Services.ToListAsync();

      // 🔥 UPSERT billing input
      var existingInput = await _context.BillingInputs
          .FirstOrDefaultAsync(x => x.ApartmentId == dto.ApartmentId && x.Period == dto.Period);

      if (existingInput == null)
      {
        existingInput = new BillingInput
        {
          ApartmentId = dto.ApartmentId,
          Period = dto.Period
        };

        _context.BillingInputs.Add(existingInput);
      }

      existingInput.WaterM3 = dto.WaterM3;
      existingInput.ElectricityKwh = dto.ElectricityKwh;
      existingInput.ResidentsCount = dto.ResidentsCount;
      existingInput.Comment = dto.Comment;

      // 🔥 СЧИТАЕМ TOTAL
      var total = CalculateInvoiceTotal(apartment, services, dto);

      // 🔥 UPSERT invoice
      var existingInvoice = await _context.Invoices
          .FirstOrDefaultAsync(x => x.ApartmentId == dto.ApartmentId && x.Period == dto.Period);

      if (existingInvoice == null)
      {
        existingInvoice = new Invoice
        {
          InvoiceIdentifier = GenerateInvoiceIdentifier(dto.Period),
          ApartmentId = dto.ApartmentId,
          Period = dto.Period,
          Total = total
        };

        _context.Invoices.Add(existingInvoice);
      }
      else
      {
        existingInvoice.Total = total;
      }

      await _context.SaveChangesAsync();

      return Ok(new
      {
        billingInput = _mapper.Map<BillingInputReadDto>(existingInput),
        invoice = new InvoiceReadDto
        {
          Id = existingInvoice.Id,
          InvoiceIdentifier = existingInvoice.InvoiceIdentifier,
          ApartmentId = existingInvoice.ApartmentId,
          Period = existingInvoice.Period,
          Total = existingInvoice.Total
        }
      });
    }

    private decimal CalculateInvoiceTotal(Dzivoklis apartment, List<Service> services, BillingInputSaveDto input)
    {
      decimal total = 0m;

      foreach (var service in services)
      {
        var formula = (service.Formula ?? "").Trim().ToLower();
        var serviceName = (service.Nosaukums ?? "").Trim().ToLower();
        var tariff = service.Tarifs;
        var taxPercent = service.Nodoklis;

        decimal baseAmount = 0m;

        if (formula == "fixed")
        {
          baseAmount = tariff;
        }
        else if (formula == "maintenance")
        {
          baseAmount = (decimal)apartment.PilnaPlatiba * tariff;
        }
        else if (formula == "residents * tariff")
        {
          baseAmount = input.ResidentsCount * tariff;
        }
        else if (formula == "area * tariff")
        {
          baseAmount = (decimal)apartment.DzivojamaPlatiba * tariff;
        }
        else if (formula == "usage * tariff")
        {
          if (service.Type == ServiceType.Water || serviceName.Contains("udens") || serviceName.Contains("water"))
          {
            baseAmount = input.WaterM3 * tariff;
          }
          else if (service.Type == ServiceType.Electricity || serviceName.Contains("electric") || serviceName.Contains("elektr"))
          {
            baseAmount = input.ElectricityKwh * tariff;
          }
        }

        var taxAmount = baseAmount * taxPercent / 100m;
        total += baseAmount + taxAmount;
      }

      return Math.Round(total, 2);
    }

    private string GenerateInvoiceIdentifier(string period)
    {
      return $"INV-{period}-{DateTime.UtcNow.Ticks.ToString()[^6..]}";
    }
  }
}
