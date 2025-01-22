using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PSPS.AccountAPI.Application.DTOs
{
    public class RedeemRequest
    {
        public Guid GiftId { get; set; }  
        public int RequiredPoints { get; set; } 
    }
}
