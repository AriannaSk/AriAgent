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
public class LeaseholdsController : ControllerBase
{
    private readonly ILeaseholdService _service;
    private readonly IMapper _mapper;

    public LeaseholdsController(ILeaseholdService service, IMapper mapper)
    {
        _service = service;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LeaseholdReadDto>>> GetLeaseholds()
    {
        var items = await _service.GetAllAsync();
        var dto = _mapper.Map<List<LeaseholdReadDto>>(items);
        return Ok(dto);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<LeaseholdReadDto>> GetLeasehold(Guid id)
    {
        var item = await _service.GetByIdAsync(id);

        if (item == null)
            return NotFound();

        return Ok(_mapper.Map<LeaseholdReadDto>(item));
    }

    [Authorize(Roles = "Manager")]
    [HttpPost]
    public async Task<ActionResult<LeaseholdReadDto>> PostLeasehold([FromBody] LeaseholdCreateDto dto)
    {
        var entity = _mapper.Map<Leasehold>(dto);

        var created = await _service.CreateAsync(entity);

        var resultDto = _mapper.Map<LeaseholdReadDto>(created);

        return CreatedAtAction(nameof(GetLeasehold), new { id = created.Id }, resultDto);
    }

    [Authorize(Roles = "Manager")]
    [HttpPut("{id}")]
    public async Task<IActionResult> PutLeasehold(Guid id, [FromBody] LeaseholdUpdateDto dto)
    {
        var entity = _mapper.Map<Leasehold>(dto);

        var ok = await _service.UpdateAsync(id, entity);

        if (!ok)
            return NotFound();

        return NoContent();
    }

    [Authorize(Roles = "Manager")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLeasehold(Guid id)
    {
        var ok = await _service.DeleteAsync(id);

        if (!ok)
            return NotFound();

        return NoContent();
    }
}