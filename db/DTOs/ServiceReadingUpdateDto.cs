using System.ComponentModel.DataAnnotations;

namespace db.DTOs
{
    public class ServiceReadingUpdateDto
    {
        [Required]
        [RegularExpression(@"^\d{4}-\d{2}$", ErrorMessage = "Period format must be YYYY-MM")]
        public string Period { get; set; } = "";

        [Range(0, 1000000)]
        public decimal PreviousValue { get; set; }

        [Range(0, 1000000)]
        public decimal CurrentValue { get; set; }
    }
}