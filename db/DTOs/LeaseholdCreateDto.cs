using System.ComponentModel.DataAnnotations;

namespace db.DTOs;

public class LeaseholdCreateDto
{
    [Required]
    public Guid ApartmentId { get; set; }
}