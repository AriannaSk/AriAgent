namespace db.DTOs;

public class DzivoklisShortDto
{
    public Guid Id { get; set; }

    public int Numurs { get; set; }

    public int Stavs { get; set; }

    public int IstabuSkaits { get; set; }

    public string MajaNosaukums { get; set; } = "";

}