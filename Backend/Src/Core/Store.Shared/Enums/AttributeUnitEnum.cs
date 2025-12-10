using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Shared.Enums;

public enum AttributeUnitEnum
{
    None = 1,       // بدون واحد
    Kg = 2,         // کیلوگرم
    Gram = 3,       // گرم
    Liter = 4,      // لیتر
    Milliliter = 5, // میلی‌لیتر
    Meter = 6,      // متر
    Centimeter = 7, // سانتی‌متر
    Piece = 8       // عدد / عدد تکی (عدد قطعه‌ای)
}
