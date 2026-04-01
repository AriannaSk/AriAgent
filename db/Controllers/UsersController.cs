using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using db.Data;
using db.Models;

namespace db.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;

    public UsersController(AppDbContext db)
    {
        _db = db;
    }

    // GET api/users
    [HttpGet]
    [Authorize(Roles = "Manager")]
    public IActionResult GetUsers()
    {
        return Ok(_db.Users.ToList());
    }

    // GET api/users/{id}
    [HttpGet("{id}")]
    public IActionResult GetUser(Guid id)
    {
        var user = _db.Users.Find(id);

        if (user == null)
            return NotFound();

        return Ok(user);
    }

    // POST api/users
    [HttpPost]
    [Authorize(Roles = "Manager")]
    public IActionResult Create(User user)
    {
        _db.Users.Add(user);
        _db.SaveChanges();

        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
    }

    // DELETE api/users/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Manager")]
    public IActionResult Delete(Guid id)
    {
        var user = _db.Users.Find(id);

        if (user == null)
            return NotFound();

        _db.Users.Remove(user);
        _db.SaveChanges();

        return NoContent();
    }
}