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
public class ServicesController : ControllerBase
{
    private readonly IServiceService _service;
    private readonly IMapper _mapper;

    public ServicesController(IServiceService service, IMapper mapper)
    {
        _service = service;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ServiceReadDto>>> GetServices()
    {
        var items = await _service.GetAllAsync();
        var dto = _mapper.Map<List<ServiceReadDto>>(items);
        return Ok(dto);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceReadDto>> GetService(Guid id)
    {
        var item = await _service.GetByIdAsync(id);

        if (item == null)
            return NotFound();

        return Ok(_mapper.Map<ServiceReadDto>(item));
    }

    [Authorize(Roles = "Manager")]
    [HttpPost]
    public async Task<ActionResult<ServiceReadDto>> PostService([FromBody] ServiceCreateDto dto)
    {
        var entity = _mapper.Map<Service>(dto);

        var created = await _service.CreateAsync(entity);

        var resultDto = _mapper.Map<ServiceReadDto>(created);

        return CreatedAtAction(nameof(GetService), new { id = created.Id }, resultDto);
    }

    [Authorize(Roles = "Manager")]
    [HttpPut("{id}")]
    public async Task<IActionResult> PutService(Guid id, [FromBody] ServiceUpdateDto dto)
    {
        var entity = _mapper.Map<Service>(dto);

        var ok = await _service.UpdateAsync(id, entity);

        if (!ok)
            return NotFound();

        return NoContent();
    }

    [Authorize(Roles = "Manager")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteService(Guid id)
    {
        var ok = await _service.DeleteAsync(id);

        if (!ok)
            return NotFound();

        return NoContent();
    }
}