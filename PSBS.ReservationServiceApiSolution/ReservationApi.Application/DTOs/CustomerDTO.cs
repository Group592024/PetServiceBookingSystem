﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReservationApi.Application.DTOs
{
    public class CustomerDTO
    {
        public string Name { get; set; }
        public string Address { get; set; }
        public string Phone { get; set; }
        public string Note { get; set; }
        public string PaymentMethod { get; set; }
        public Guid CusId { get; set; }
    }
}
