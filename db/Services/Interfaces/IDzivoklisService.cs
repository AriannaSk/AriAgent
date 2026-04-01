using db.Models;

namespace db.Services.Interfaces;

public interface IDzivoklisService
{
    Task<List<Dzivoklis>> GetAllAsync();
    Task<Dzivoklis?> GetByIdAsync(Guid id);
    Task<List<Dzivoklis>> GetByHouseIdAsync(Guid houseId);
    Task<List<Dzivoklis>> GetByUserIdAsync(Guid userId);
    Task<Dzivoklis?> GetMyByIdAsync(Guid userId, Guid apartmentId);
    Task<Dzivoklis> CreateAsync(Dzivoklis dzivoklis, List<Guid> iedzivotajsIds);
    Task<bool> UpdateAsync(Guid id, Dzivoklis dzivoklis, List<Guid> iedzivotajsIds);
    Task<bool> DeleteAsync(Guid id);
}