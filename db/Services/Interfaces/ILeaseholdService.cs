using db.Models;

namespace db.Services.Interfaces;

public interface ILeaseholdService
{
    Task<List<Leasehold>> GetAllAsync();

    Task<Leasehold?> GetByIdAsync(Guid id);

    Task<Leasehold> CreateAsync(Leasehold leasehold);

    Task<bool> UpdateAsync(Guid id, Leasehold leasehold);

    Task<bool> DeleteAsync(Guid id);
}