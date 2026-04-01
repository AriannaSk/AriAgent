using System.ComponentModel.DataAnnotations;

namespace db.DTOs;

public class ServiceCreateDto
{
    [Required]
    [StringLength(100)]
    public string Nosaukums { get; set; } = "";

    [Range(0, 10000)]
    public decimal Tarifs { get; set; }

    [Range(0, 100)]
    public decimal Nodoklis { get; set; }

    [Required]
    [StringLength(200)]
    public string Formula { get; set; } = "";
}