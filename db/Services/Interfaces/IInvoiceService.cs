using db.Models;

namespace db.Services.Interfaces;

public interface IInvoiceService
{
    Task<List<Invoice>> GetAllAsync();

    Task<Invoice?> GetByIdAsync(Guid id);

    Task<List<Invoice>> GetMyByApartmentIdAsync(Guid userId, Guid apartmentId);

    Task<Invoice> CreateAsync(Invoice invoice);

    Task<bool> UpdateAsync(Guid id, Invoice invoice);

    Task<bool> DeleteAsync(Guid id);
}