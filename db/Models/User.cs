namespace db.Models;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Email { get; set; } = "";

    public string Password { get; set; } = "";

    public string Role { get; set; } = "";   // Manager vai Resident

    public Guid? IedzivotajsId { get; set; }

    public Iedzivotajs? Iedzivotajs { get; set; }
}