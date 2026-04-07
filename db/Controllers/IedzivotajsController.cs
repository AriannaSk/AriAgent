using AutoMapper;
using db.DTOs;
using db.Models;
using db.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace db.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class IedzivotajsController : ControllerBase
{
    private readonly IIedzivotajsService _service;
    private readonly IMapper _mapper;

    public IedzivotajsController(IIedzivotajsService service, IMapper mapper)
    {
        _service = service;
        _mapper = mapper;
    }

    // READ (Manager + Resident)
    // READ all residents
    [Authorize(Roles = "Manager")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<IedzivotajsReadDto>>> GetIedzivotaji()
    {
        var items = await _service.GetAllAsync();
        var dto = _mapper.Map<List<IedzivotajsReadDto>>(items);
        return Ok(dto);
    }

    // READ by id
    // READ resident by id
    [Authorize(Roles = "Manager")]
    [HttpGet("{id}")]
    public async Task<ActionResult<IedzivotajsReadDto>> GetIedzivotajs(Guid id)
    {
        var item = await _service.GetByIdAsync(id);

        if (item is null)
            return NotFound();

        return Ok(_mapper.Map<IedzivotajsReadDto>(item));
    }

    // CREATE resident
    [Authorize(Roles = "Manager")]
    [HttpPost]
    public async Task<ActionResult<IedzivotajsReadDto>> PostIedzivotajs(IedzivotajsCreateDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var entity = _mapper.Map<Iedzivotajs>(dto);

            var created = await _service.CreateAsync(entity, dto.DzivoklisIds);

            var resultDto = _mapper.Map<IedzivotajsReadDto>(created);

            return CreatedAtAction(nameof(GetIedzivotajs), new { id = created.Id }, resultDto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = ex.Message,
                inner = ex.InnerException?.Message
            });
        }
    }
    // CREATE resident with account
    [Authorize(Roles = "Manager")]
    [HttpPost("with-account")]
    public async Task<ActionResult<IedzivotajsReadDto>> PostIedzivotajsWithAccount(ResidentAccountCreateDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _service.CreateWithAccountAsync(dto);

            var resultDto = _mapper.Map<IedzivotajsReadDto>(created);

            return CreatedAtAction(nameof(GetIedzivotajs), new { id = created.Id }, resultDto);
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message,
                inner = ex.InnerException?.Message
            });
        }
    }
  // CREATE account for existing resident
  [Authorize(Roles = "Manager")]
  [HttpPost("{id}/create-account")]
  public async Task<IActionResult> CreateAccountForExistingResident(Guid id, [FromBody] ResidentExistingAccountCreateDto dto)
  {
    try
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      if (id != dto.ResidentId)
        return BadRequest("Id mismatch");

      var ok = await _service.CreateAccountForExistingResidentAsync(dto);

      if (!ok)
        return BadRequest(new
        {
          message = "Failed to create account for resident."
        });

      return Ok(new
      {
        message = "Account created successfully."
      });
    }
    catch (Exception ex)
    {
      return BadRequest(new
      {
        message = ex.Message,
        inner = ex.InnerException?.Message
      });
    }
  }

  // UPDATE resident
  [Authorize(Roles = "Manager,Resident")]
    [HttpPut("{id}")]
    public async Task<IActionResult> PutIedzivotajs(Guid id, IedzivotajsUpdateDto dto)
    {
        if (id != dto.Id)
            return BadRequest("Id mismatch");

        var entity = _mapper.Map<Iedzivotajs>(dto);

        var ok = await _service.UpdateAsync(id, entity, dto.DzivoklisIds);

        if (!ok)
            return NotFound();

        return NoContent();
    }

    // DELETE resident
    [Authorize(Roles = "Manager")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteIedzivotajs(Guid id)
    {
        var ok = await _service.DeleteAsync(id);

        if (!ok)
            return NotFound();

        return NoContent();
    }
    // READ current resident profile
    [Authorize(Roles = "Resident")]
    [HttpGet("me")]
    public async Task<ActionResult<IedzivotajsReadDto>> GetMe()
    {
        var userIdClaim = User.FindFirst("UserId")?.Value;

        if (string.IsNullOrWhiteSpace(userIdClaim))
            return Unauthorized("UserId claim not found.");

        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized("Invalid UserId claim.");

        var resident = await _service.GetByUserIdAsync(userId);

        if (resident == null)
            return NotFound("Resident profile not found.");

        var dto = _mapper.Map<IedzivotajsReadDto>(resident);

        return Ok(dto);
    }
}
