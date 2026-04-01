using db.DTOs;

public class IedzivotajsReadDto
{
    public Guid Id { get; set; }

    public string Vards { get; set; } = "";

    public string Uzvards { get; set; } = "";

    public string PersonasKods { get; set; } = "";

    public string Telefons { get; set; } = "";

    public string Epasts { get; set; } = "";

    public bool IsOwner { get; set; }

    public List<DzivoklisShortDto> Dzivokli { get; set; } = new();
}