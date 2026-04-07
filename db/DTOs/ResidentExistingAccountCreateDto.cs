using System.ComponentModel.DataAnnotations;

namespace db.DTOs;

public class ResidentExistingAccountCreateDto
{
  [Required]
  public Guid ResidentId { get; set; }

  [Required]
  [EmailAddress]
  public string LoginEmail { get; set; } = string.Empty;

  [Required]
  [MinLength(6)]
  public string Password { get; set; } = string.Empty;
}
