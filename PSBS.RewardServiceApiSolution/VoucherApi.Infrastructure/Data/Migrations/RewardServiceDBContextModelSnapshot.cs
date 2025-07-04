﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using VoucherApi.Infrastructure.Data;

#nullable disable

namespace VoucherApi.Infrastructure.Data.Migrations
{
    [DbContext(typeof(RewardServiceDBContext))]
    partial class RewardServiceDBContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.8")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("VoucherApi.Domain.Entities.Gift", b =>
                {
                    b.Property<Guid>("GiftId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("gift_id");

                    b.Property<string>("GiftCode")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("gift_code");

                    b.Property<string>("GiftDescription")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("gift_description");

                    b.Property<string>("GiftImage")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("gift_image");

                    b.Property<string>("GiftName")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("gift_name");

                    b.Property<int>("GiftPoint")
                        .HasColumnType("int")
                        .HasColumnName("gift_point");

                    b.Property<int>("GiftQuantity")
                        .HasColumnType("int")
                        .HasColumnName("gift_quantity");

                    b.Property<bool>("GiftStatus")
                        .HasColumnType("bit")
                        .HasColumnName("gift_status");

                    b.HasKey("GiftId");

                    b.ToTable("Gifts");
                });

            modelBuilder.Entity("VoucherApi.Domain.Entities.RedeemGiftHistory", b =>
                {
                    b.Property<Guid>("RedeemHistoryId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("redeemhistory_id");

                    b.Property<Guid>("AccountId")
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("account_id");

                    b.Property<Guid>("GiftId")
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("gift_id");

                    b.Property<Guid>("ReddeemStautsId")
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("gift_status_id");

                    b.Property<DateTime>("RedeemDate")
                        .HasColumnType("datetime2")
                        .HasColumnName("redeem_date");

                    b.Property<int>("RedeemPoint")
                        .HasColumnType("int")
                        .HasColumnName("redeem_point");

                    b.HasKey("RedeemHistoryId");

                    b.HasIndex("GiftId");

                    b.HasIndex("ReddeemStautsId");

                    b.ToTable("RedeemGiftHistories");
                });

            modelBuilder.Entity("VoucherApi.Domain.Entities.RedeemStatus", b =>
                {
                    b.Property<Guid>("ReddeemStautsId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("redeem_status_id");

                    b.Property<string>("RedeemName")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("redeem_status_name");

                    b.HasKey("ReddeemStautsId");

                    b.ToTable("RedeemStatuses");

                    b.HasData(
                        new
                        {
                            ReddeemStautsId = new Guid("6a565faf-d31e-4ec7-ad20-433f34e3d7a9"),
                            RedeemName = "Just Redeemed"
                        },
                        new
                        {
                            ReddeemStautsId = new Guid("33b84495-c2a6-4b3e-98ca-f13d9c150946"),
                            RedeemName = "Picked up at Store"
                        },
                        new
                        {
                            ReddeemStautsId = new Guid("1509e4e6-e1ec-42a4-9301-05131dd498e4"),
                            RedeemName = "Canceled Redeem"
                        });
                });

            modelBuilder.Entity("VoucherApi.Domain.Entities.Voucher", b =>
                {
                    b.Property<Guid>("VoucherId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier")
                        .HasColumnName("voucher_id");

                    b.Property<bool>("IsDeleted")
                        .HasColumnType("bit")
                        .HasColumnName("is_deleted");

                    b.Property<bool>("IsGift")
                        .HasColumnType("bit")
                        .HasColumnName("is_gift");

                    b.Property<string>("VoucherCode")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("voucher_code");

                    b.Property<string>("VoucherDescription")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("voucher_description");

                    b.Property<int>("VoucherDiscount")
                        .HasColumnType("int")
                        .HasColumnName("voucher_discount");

                    b.Property<DateTime>("VoucherEndDate")
                        .HasColumnType("datetime2")
                        .HasColumnName("voucher_end_date");

                    b.Property<decimal>("VoucherMaximum")
                        .HasColumnType("decimal(18,2)")
                        .HasColumnName("voucher_maximum");

                    b.Property<decimal>("VoucherMinimumSpend")
                        .HasColumnType("decimal(18,2)")
                        .HasColumnName("voucher_minimum_spend");

                    b.Property<string>("VoucherName")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("voucher_name");

                    b.Property<int>("VoucherQuantity")
                        .HasColumnType("int")
                        .HasColumnName("voucher_quantity");

                    b.Property<DateTime>("VoucherStartDate")
                        .HasColumnType("datetime2")
                        .HasColumnName("voucher_start_date");

                    b.HasKey("VoucherId");

                    b.ToTable("Vouchers");
                });

            modelBuilder.Entity("VoucherApi.Domain.Entities.RedeemGiftHistory", b =>
                {
                    b.HasOne("VoucherApi.Domain.Entities.Gift", "Gift")
                        .WithMany("RedeemGiftHistories")
                        .HasForeignKey("GiftId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("VoucherApi.Domain.Entities.RedeemStatus", "RedeemStatus")
                        .WithMany("RedeemGiftHistories")
                        .HasForeignKey("ReddeemStautsId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Gift");

                    b.Navigation("RedeemStatus");
                });

            modelBuilder.Entity("VoucherApi.Domain.Entities.Gift", b =>
                {
                    b.Navigation("RedeemGiftHistories");
                });

            modelBuilder.Entity("VoucherApi.Domain.Entities.RedeemStatus", b =>
                {
                    b.Navigation("RedeemGiftHistories");
                });
#pragma warning restore 612, 618
        }
    }
}
