using db.Models;

namespace db.Services.Interfaces;

public interface IServiceService
{
    Task<List<Service>> GetAllAsync();

    Task<Service?> GetByIdAsync(Guid id);

    Task<Service> CreateAsync(Service service);

    Task<bool> UpdateAsync(Guid id, Service service);

    Task<bool> DeleteAsync(Guid id);
}