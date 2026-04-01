using AutoMapper;
using db.DTOs;
using db.Models;
using db.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace db.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MajasController : ControllerBase
{
    private readonly IMajasService _service;
    private readonly IMapper _mapper;

    public MajasController(IMajasService service, IMapper mapper)
    {
        _service = service;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MajaReadDto>>> GetAll()
    {
        var items = await _service.GetAllAsync();
        return Ok(_mapper.Map<List<MajaReadDto>>(items));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MajaReadDto>> GetById(Guid id)
    {
        var item = await _service.GetByIdAsync(id);

        if (item == null)
            return NotFound();

        return Ok(_mapper.Map<MajaReadDto>(item));
    }

    [Authorize(Roles = "Manager")]
    [HttpPost]
    public async Task<ActionResult<MajaReadDto>> Create([FromBody] MajaCreateDto dto)
    {
        var entity = _mapper.Map<Maja>(dto);
        var created = await _service.CreateAsync(entity);

        return CreatedAtAction(nameof(GetById),
            new { id = created.Id },
            _mapper.Map<MajaReadDto>(created));
    }

    [Authorize(Roles = "Manager")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] MajaUpdateDto dto)
    {
        if (id != dto.Id)
            return BadRequest();

        var entity = _mapper.Map<Maja>(dto);
        var ok = await _service.UpdateAsync(id, entity);

        if (!ok)
            return NotFound();

        return NoContent();
    }

    [Authorize(Roles = "Manager")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var ok = await _service.DeleteAsync(id);

        if (!ok)
            return NotFound();

        return NoContent();
    }
}