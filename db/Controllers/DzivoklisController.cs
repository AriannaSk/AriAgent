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
public class DzivoklisController : ControllerBase
{
    private readonly IDzivoklisService _service;
    private readonly IMapper _mapper;

    public DzivoklisController(IDzivoklisService service, IMapper mapper)
    {
        _service = service;
        _mapper = mapper;
    }

    // READ all apartments (Manager only)
    [Authorize(Roles = "Manager")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DzivoklisReadDto>>> GetDzivokli()
    {
        var items = await _service.GetAllAsync();
        var dto = _mapper.Map<List<DzivoklisReadDto>>(items);
        return Ok(dto);
    }

    // READ apartment by id (Manager only)
    [Authorize(Roles = "Manager")]
    [HttpGet("{id}")]
    public async Task<ActionResult<DzivoklisReadDto>> GetDzivoklis(Guid id)
    {
        var item = await _service.GetByIdAsync(id);

        if (item is null)
            return NotFound();

        return Ok(_mapper.Map<DzivoklisReadDto>(item));
    }

    // CREATE apartment (Manager only)
    [Authorize(Roles = "Manager")]
    [HttpPost]
    public async Task<ActionResult<DzivoklisReadDto>> PostDzivoklis([FromBody] DzivoklisCreateDto dto)
    {
        var entity = _mapper.Map<Dzivoklis>(dto);

        var created = await _service.CreateAsync(entity, dto.IedzivotajsIds);

        var resultDto = _mapper.Map<DzivoklisReadDto>(created);

        return CreatedAtAction(nameof(GetDzivoklis), new { id = created.Id }, resultDto);
    }

    // UPDATE apartment (Manager only)
    [Authorize(Roles = "Manager")]
    [HttpPut("{id}")]
    public async Task<IActionResult> PutDzivoklis(Guid id, [FromBody] DzivoklisUpdateDto dto)
    {
        if (id != dto.Id)
            return BadRequest("Id mismatch");

        var entity = _mapper.Map<Dzivoklis>(dto);

        var ok = await _service.UpdateAsync(id, entity, dto.IedzivotajsIds);

        if (!ok)
            return NotFound();

        return NoContent();
    }

    // GET apartments by house (Manager only)
    [Authorize(Roles = "Manager")]
    [HttpGet("byHouse/{houseId}")]
    public async Task<ActionResult<IEnumerable<DzivoklisReadDto>>> GetByHouse(Guid houseId)
    {
        var items = await _service.GetByHouseIdAsync(houseId);
        var dto = _mapper.Map<List<DzivoklisReadDto>>(items);
        return Ok(dto);
    }

    // DELETE apartment (Manager only)
    [Authorize(Roles = "Manager")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDzivoklis(Guid id)
    {
        var ok = await _service.DeleteAsync(id);

        if (!ok)
            return NotFound();

        return NoContent();
    }

    // READ current resident apartments
    [Authorize(Roles = "Resident")]
    [HttpGet("my")]
    public async Task<ActionResult<IEnumerable<DzivoklisReadDto>>> GetMyDzivokli()
    {
        var userIdClaim = User.FindFirst("UserId")?.Value;

        if (string.IsNullOrWhiteSpace(userIdClaim))
            return Unauthorized("UserId claim not found.");

        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized("Invalid UserId claim.");

        var items = await _service.GetByUserIdAsync(userId);
        var dto = _mapper.Map<List<DzivoklisReadDto>>(items);

        return Ok(dto);
    }

    // READ current resident apartment by id
    [Authorize(Roles = "Resident")]
    [HttpGet("my/{id}")]
    public async Task<ActionResult<DzivoklisReadDto>> GetMyDzivoklisById(Guid id)
    {
        var userIdClaim = User.FindFirst("UserId")?.Value;

        if (string.IsNullOrWhiteSpace(userIdClaim))
            return Unauthorized("UserId claim not found.");

        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized("Invalid UserId claim.");

        var item = await _service.GetMyByIdAsync(userId, id);

        if (item == null)
            return NotFound();

        return Ok(_mapper.Map<DzivoklisReadDto>(item));
    }
  // UPDATE current resident apartment
  [Authorize(Roles = "Resident")]
  [HttpPut("my/{id}")]
  public async Task<IActionResult> PutMyDzivoklis(Guid id, [FromBody] DzivoklisUpdateDto dto)
  {
    if (id != dto.Id)
      return BadRequest("Id mismatch");

    var userIdClaim = User.FindFirst("UserId")?.Value;

    if (string.IsNullOrWhiteSpace(userIdClaim))
      return Unauthorized("UserId claim not found.");

    if (!Guid.TryParse(userIdClaim, out var userId))
      return Unauthorized("Invalid UserId claim.");

    var myApartment = await _service.GetMyByIdAsync(userId, id);

    if (myApartment == null)
      return Forbid();

    var entity = _mapper.Map<Dzivoklis>(dto);

    var residentIds = myApartment.Iedzivotaji.Select(x => x.Id).ToList();

    var ok = await _service.UpdateAsync(id, entity, residentIds);

    if (!ok)
      return NotFound();

    return NoContent();
  }
}
