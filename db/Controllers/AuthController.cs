using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using db.Data;
using db.DTOs;

namespace db.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
  private readonly AppDbContext _db;
  private readonly IConfiguration _config;

  public AuthController(AppDbContext db, IConfiguration config)
  {
    _db = db;
    _config = config;
  }

  [HttpPost("login")]
  public async Task<IActionResult> Login([FromBody] LoginDto dto)
  {
    if (dto == null)
      return BadRequest("Request body is required.");

    if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
      return BadRequest("Email and password are required.");

    var user = await _db.Users.FirstOrDefaultAsync(u =>
        u.Email == dto.Email &&
        u.Password == dto.Password);

    if (user == null)
      return Unauthorized("Invalid email or password.");

    var jwtKey = _config["Jwt:Key"];
    var issuer = _config["Jwt:Issuer"] ?? "ApartmentAPI";
    var audience = _config["Jwt:Audience"] ?? "ApartmentAPI";

    if (string.IsNullOrWhiteSpace(jwtKey))
      throw new Exception("JWT key is missing in configuration.");

    var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("UserId", user.Id.ToString())
        };

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
        issuer: issuer,
        audience: audience,
        claims: claims,
        expires: DateTime.UtcNow.AddHours(2),
        signingCredentials: creds
    );

    var jwt = new JwtSecurityTokenHandler().WriteToken(token);

    return Ok(new
    {
      token = jwt
    });
  }
}
