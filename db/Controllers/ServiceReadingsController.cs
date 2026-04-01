using db.Data;
using db.DTOs;
using db.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace db.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ServiceReadingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ServiceReadingsController(AppDbContext context)
        {
            _context = context;
        }

        private async Task<Guid?> GetCurrentResidentIdAsync()
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;

            if (string.IsNullOrWhiteSpace(userIdClaim))
                return null;

            if (!Guid.TryParse(userIdClaim, out var userId))
                return null;

            var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == userId);

            return user?.IedzivotajsId;
        }

        private async Task<bool> ResidentOwnsApartmentAsync(Guid residentId, Guid apartmentId)
        {
            return await _context.Iedzivotaji
                .Where(r => r.Id == residentId)
                .AnyAsync(r => r.Dzivokli.Any(a => a.Id == apartmentId));
        }

        [Authorize(Roles = "Resident")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ServiceReadingCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.CurrentValue < dto.PreviousValue)
                return BadRequest("Current value cannot be less than previous value.");

            var residentId = await GetCurrentResidentIdAsync();
            if (residentId == null)
                return Unauthorized("Resident not found for current user.");

            var ownsApartment = await ResidentOwnsApartmentAsync(residentId.Value, dto.ApartmentId);
            if (!ownsApartment)
                return Forbid();

            var apartmentExists = await _context.Dzivokli.AnyAsync(x => x.Id == dto.ApartmentId);
            if (!apartmentExists)
                return BadRequest("Apartment not found.");

            var service = await _context.Services.FirstOrDefaultAsync(x => x.Id == dto.ServiceId);
            if (service == null)
                return BadRequest("Service not found.");

            if (service.Type != ServiceType.Electricity && service.Type != ServiceType.Water)
                return BadRequest("Readings can only be submitted for electricity and water.");

            var exists = await _context.ServiceReadings.AnyAsync(x =>
                x.ApartmentId == dto.ApartmentId &&
                x.ServiceId == dto.ServiceId &&
                x.Period == dto.Period &&
                x.ResidentId == residentId.Value);

            if (exists)
                return BadRequest("Reading for this service and period already exists.");

            var reading = new ServiceReading
            {
                ApartmentId = dto.ApartmentId,
                ResidentId = residentId.Value,
                ServiceId = dto.ServiceId,
                Period = dto.Period,
                PreviousValue = dto.PreviousValue,
                CurrentValue = dto.CurrentValue,
                Usage = dto.CurrentValue - dto.PreviousValue,
                SubmittedAt = DateTime.UtcNow
            };

            _context.ServiceReadings.Add(reading);
            await _context.SaveChangesAsync();

            return Ok(new ServiceReadingReadDto
            {
                Id = reading.Id,
                ApartmentId = reading.ApartmentId,
                ResidentId = reading.ResidentId,
                ServiceId = reading.ServiceId,
                ServiceName = service.Nosaukums,
                Period = reading.Period,
                PreviousValue = reading.PreviousValue,
                CurrentValue = reading.CurrentValue,
                Usage = reading.Usage,
                SubmittedAt = reading.SubmittedAt
            });
        }

        [Authorize(Roles = "Resident")]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyReadings()
        {
            var residentId = await GetCurrentResidentIdAsync();
            if (residentId == null)
                return Unauthorized("Resident not found for current user.");

            var items = await _context.ServiceReadings
                .Include(x => x.Service)
                .Where(x => x.ResidentId == residentId.Value)
                .OrderByDescending(x => x.Period)
                .ThenByDescending(x => x.SubmittedAt)
                .Select(x => new ServiceReadingReadDto
                {
                    Id = x.Id,
                    ApartmentId = x.ApartmentId,
                    ResidentId = x.ResidentId,
                    ServiceId = x.ServiceId,
                    ServiceName = x.Service != null ? x.Service.Nosaukums : "",
                    Period = x.Period,
                    PreviousValue = x.PreviousValue,
                    CurrentValue = x.CurrentValue,
                    Usage = x.Usage,
                    SubmittedAt = x.SubmittedAt
                })
                .ToListAsync();

            return Ok(items);
        }

        [Authorize(Roles = "Resident")]
        [HttpPut("my/{id}")]
        public async Task<IActionResult> UpdateMyReading(Guid id, [FromBody] ServiceReadingUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.CurrentValue < dto.PreviousValue)
                return BadRequest("Current value cannot be less than previous value.");

            var residentId = await GetCurrentResidentIdAsync();
            if (residentId == null)
                return Unauthorized("Resident not found for current user.");

            var reading = await _context.ServiceReadings
                .Include(x => x.Service)
                .FirstOrDefaultAsync(x => x.Id == id && x.ResidentId == residentId.Value);

            if (reading == null)
                return NotFound("Reading not found.");

            var ownsApartment = await ResidentOwnsApartmentAsync(residentId.Value, reading.ApartmentId);
            if (!ownsApartment)
                return Forbid();

            reading.Period = dto.Period;
            reading.PreviousValue = dto.PreviousValue;
            reading.CurrentValue = dto.CurrentValue;
            reading.Usage = dto.CurrentValue - dto.PreviousValue;
            reading.SubmittedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new ServiceReadingReadDto
            {
                Id = reading.Id,
                ApartmentId = reading.ApartmentId,
                ResidentId = reading.ResidentId,
                ServiceId = reading.ServiceId,
                ServiceName = reading.Service != null ? reading.Service.Nosaukums : "",
                Period = reading.Period,
                PreviousValue = reading.PreviousValue,
                CurrentValue = reading.CurrentValue,
                Usage = reading.Usage,
                SubmittedAt = reading.SubmittedAt
            });
        }

        [Authorize(Roles = "Manager")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _context.ServiceReadings
                .Include(x => x.Service)
                .OrderByDescending(x => x.Period)
                .ThenByDescending(x => x.SubmittedAt)
                .Select(x => new ServiceReadingReadDto
                {
                    Id = x.Id,
                    ApartmentId = x.ApartmentId,
                    ResidentId = x.ResidentId,
                    ServiceId = x.ServiceId,
                    ServiceName = x.Service != null ? x.Service.Nosaukums : "",
                    Period = x.Period,
                    PreviousValue = x.PreviousValue,
                    CurrentValue = x.CurrentValue,
                    Usage = x.Usage,
                    SubmittedAt = x.SubmittedAt
                })
                .ToListAsync();

            return Ok(items);
        }
    }
}