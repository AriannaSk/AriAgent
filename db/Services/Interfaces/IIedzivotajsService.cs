using db.DTOs;
using db.Models;

namespace db.Services.Interfaces;

public interface IIedzivotajsService
{
  Task<List<Iedzivotajs>> GetAllAsync();
  Task<Iedzivotajs?> GetByIdAsync(Guid id);
  Task<Iedzivotajs?> GetByUserIdAsync(Guid userId);

  Task<Iedzivotajs> CreateAsync(Iedzivotajs iedzivotajs, List<Guid> dzivoklisIds);
  Task<Iedzivotajs> CreateWithAccountAsync(ResidentAccountCreateDto dto);
  Task<bool> CreateAccountForExistingResidentAsync(ResidentExistingAccountCreateDto dto);
  Task<bool> UpdateAsync(Guid id, Iedzivotajs iedzivotajs, List<Guid> dzivoklisIds);

  Task<bool> DeleteAsync(Guid id);
}
