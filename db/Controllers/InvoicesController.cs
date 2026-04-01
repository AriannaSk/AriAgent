using AutoMapper;
using db.DTOs;
using db.Models;
using db.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace db.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceService _service;
    private readonly IMapper _mapper;

    public InvoicesController(IInvoiceService service, IMapper mapper)
    {
        _service = service;
        _mapper = mapper;
    }

    // READ all invoices (Manager only)
    [Authorize(Roles = "Manager")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<InvoiceReadDto>>> GetInvoices()
    {
        var items = await _service.GetAllAsync();
        var dto = _mapper.Map<List<InvoiceReadDto>>(items);
        return Ok(dto);
    }

    // READ invoice by id (Manager only)
    [Authorize(Roles = "Manager")]
    [HttpGet("{id}")]
    public async Task<ActionResult<InvoiceReadDto>> GetInvoice(Guid id)
    {
        var item = await _service.GetByIdAsync(id);

        if (item == null)
            return NotFound();

        return Ok(_mapper.Map<InvoiceReadDto>(item));
    }

    // READ my invoices by apartment (Resident only)
    [Authorize(Roles = "Resident")]
    [HttpGet("my/apartment/{apartmentId}")]
    public async Task<ActionResult<IEnumerable<InvoiceReadDto>>> GetMyInvoicesByApartment(Guid apartmentId)
    {
        var userIdClaim = User.FindFirst("UserId")?.Value;

        if (string.IsNullOrWhiteSpace(userIdClaim))
            return Unauthorized("UserId claim not found.");

        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized("Invalid UserId claim.");

        var items = await _service.GetMyByApartmentIdAsync(userId, apartmentId);

        var dto = _mapper.Map<List<InvoiceReadDto>>(items);

        return Ok(dto);
    }

    [Authorize(Roles = "Manager")]
    [HttpPost]
    public async Task<ActionResult<InvoiceReadDto>> PostInvoice([FromBody] InvoiceCreateDto dto)
    {
        var entity = _mapper.Map<Invoice>(dto);

        var created = await _service.CreateAsync(entity);

        var resultDto = _mapper.Map<InvoiceReadDto>(created);

        return CreatedAtAction(nameof(GetInvoice), new { id = created.Id }, resultDto);
    }

    [Authorize(Roles = "Manager")]
    [HttpPut("{id}")]
    public async Task<IActionResult> PutInvoice(Guid id, [FromBody] InvoiceUpdateDto dto)
    {
        var entity = _mapper.Map<Invoice>(dto);

        var ok = await _service.UpdateAsync(id, entity);

        if (!ok)
            return NotFound();

        return NoContent();
    }

    [Authorize(Roles = "Manager")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteInvoice(Guid id)
    {
        var ok = await _service.DeleteAsync(id);

        if (!ok)
            return NotFound();

        return NoContent();
    }
}