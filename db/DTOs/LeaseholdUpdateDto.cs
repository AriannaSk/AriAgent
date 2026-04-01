using System.ComponentModel.DataAnnotations;

namespace db.DTOs;

public class LeaseholdUpdateDto
{
    [Required]
    public Guid ApartmentId { get; set; }
}