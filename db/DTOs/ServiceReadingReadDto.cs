namespace db.DTOs
{
    public class ServiceReadingReadDto
    {
        public Guid Id { get; set; }
        public Guid ApartmentId { get; set; }
        public Guid ResidentId { get; set; }
        public Guid ServiceId { get; set; }
        public string ServiceName { get; set; } = "";
        public string Period { get; set; } = "";
        public decimal PreviousValue { get; set; }
        public decimal CurrentValue { get; set; }
        public decimal Usage { get; set; }
        public DateTime SubmittedAt { get; set; }
    }
}