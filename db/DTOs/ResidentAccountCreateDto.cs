using System.ComponentModel.DataAnnotations;

namespace db.DTOs;

public class ResidentAccountCreateDto
{
    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string Vards { get; set; } = "";

    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string Uzvards { get; set; } = "";

    [Required]
    [RegularExpression(@"^\d{6}-\d{5}$",
        ErrorMessage = "Personas kods format: 123456-12345")]
    public string PersonasKods { get; set; } = "";

    [Phone]
    public string Telefons { get; set; } = "";

    [EmailAddress]
    [StringLength(100)]
    public string Epasts { get; set; } = "";

    public bool IsOwner { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "Resident must be assigned to at least one apartment")]
    public List<Guid> DzivoklisIds { get; set; } = new();

    [Required]
    [EmailAddress]
    [StringLength(100)]
    public string LoginEmail { get; set; } = "";

    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string Password { get; set; } = "";
}