using db.Models;

namespace db.Services.Interfaces;

public interface IMajasService
{
    Task<List<Maja>> GetAllAsync();
    Task<Maja?> GetByIdAsync(Guid id);
    Task<Maja> CreateAsync(Maja maja);
    Task<bool> UpdateAsync(Guid id, Maja maja);
    Task<bool> DeleteAsync(Guid id);
}