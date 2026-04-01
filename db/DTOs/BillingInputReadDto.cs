namespace db.DTOs
{
    public class BillingInputReadDto
    {
        public Guid Id { get; set; }
        public Guid ApartmentId { get; set; }
        public string Period { get; set; } = "";
        public decimal WaterM3 { get; set; }
        public decimal ElectricityKwh { get; set; }
        public int ResidentsCount { get; set; }
        public string? Comment { get; set; }
    }
}