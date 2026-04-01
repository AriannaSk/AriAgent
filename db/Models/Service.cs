using System.ComponentModel.DataAnnotations;

namespace db.Models
{
    public enum ServiceType
    {
        Electricity,
        Maintenance,
        Garbage,
        Heating,
        Water
    }

    public class Service
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [StringLength(100)]
        public string Nosaukums { get; set; } = "";

        [Range(0, 10000, ErrorMessage = "Tariff must be between 0 and 10000")]
        public decimal Tarifs { get; set; }

        [Range(0, 100, ErrorMessage = "Tax must be between 0 and 100")]
        public decimal Nodoklis { get; set; }

        [Required]
        [StringLength(200)]
        public string Formula { get; set; } = "";

        // 🔥 ВОТ ЭТО ДОБАВЛЯЕМ
        public ServiceType Type { get; set; }

        public List<Invoice> Invoices { get; set; } = new();
    }
}