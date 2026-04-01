using AutoMapper;
using db.DTOs;
using db.Models;

namespace db.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // =========================
        // MAJA
        // =========================
        CreateMap<Maja, MajaReadDto>();
        CreateMap<MajaCreateDto, Maja>();
        CreateMap<MajaUpdateDto, Maja>();

        // =========================
        // DZIVOKLIS
        // =========================

        // 🔥 FULL DTO (если используешь где-то подробно)
        CreateMap<Dzivoklis, DzivoklisReadDto>();

        // 🔥 ВОТ ГЛАВНЫЙ ФИКС
        CreateMap<Dzivoklis, DzivoklisShortDto>()
            .ForMember(dest => dest.MajaNosaukums, opt => opt.MapFrom(src =>
                src.Maja != null
                    ? src.Maja.Iela + " " + src.Maja.Numurs + ", " + src.Maja.Pilseta
                    : ""
            ));

        CreateMap<DzivoklisCreateDto, Dzivoklis>()
            .ForMember(d => d.Iedzivotaji, opt => opt.Ignore());

        CreateMap<DzivoklisUpdateDto, Dzivoklis>()
            .ForMember(d => d.Iedzivotaji, opt => opt.Ignore());

        // =========================
        // IEDZIVOTAJS
        // =========================

        CreateMap<Iedzivotajs, IedzivotajsReadDto>();
        CreateMap<Iedzivotajs, IedzivotajsShortDto>();

        CreateMap<IedzivotajsCreateDto, Iedzivotajs>()
            .ForMember(d => d.Dzivokli, opt => opt.Ignore());

        CreateMap<IedzivotajsUpdateDto, Iedzivotajs>()
            .ForMember(d => d.Dzivokli, opt => opt.Ignore());

        // =========================
        // SERVICE
        // =========================
        CreateMap<Service, ServiceReadDto>();
        CreateMap<ServiceCreateDto, Service>();
        CreateMap<ServiceUpdateDto, Service>();

        // =========================
        // INVOICE
        // =========================
        CreateMap<Invoice, InvoiceReadDto>();
        CreateMap<InvoiceCreateDto, Invoice>();
        CreateMap<InvoiceUpdateDto, Invoice>();

        // =========================
        // LEASEHOLD
        // =========================
        CreateMap<Leasehold, LeaseholdReadDto>();
        CreateMap<LeaseholdCreateDto, Leasehold>();
        CreateMap<LeaseholdUpdateDto, Leasehold>();

        CreateMap<BillingInput, BillingInputReadDto>();
        CreateMap<BillingInputSaveDto, BillingInput>();
    }
}