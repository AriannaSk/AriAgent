using System.ComponentModel.DataAnnotations;

namespace db.Models;

public class Iedzivotajs
{
    public Guid Id { get; set; } = Guid.NewGuid();

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
    public string Epasts { get; set; } = "";

    public bool IsOwner { get; set; }

    public List<Dzivoklis> Dzivokli { get; set; } = new();
    public User? User { get; set; }
}