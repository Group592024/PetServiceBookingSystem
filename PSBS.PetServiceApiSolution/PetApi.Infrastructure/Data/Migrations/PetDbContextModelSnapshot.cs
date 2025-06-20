﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using PetApi.Infrastructure.Data;

#nullable disable

namespace PetApi.Infrastructure.Data.Migrations
{
    [DbContext(typeof(PetDbContext))]
    partial class PetDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.8")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("PetApi.Domain.Entities.Pet", b =>
                {
                    b.Property<Guid>("Pet_ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<Guid>("Account_ID")
                        .HasColumnType("uniqueidentifier");

                    b.Property<DateTime>("Date_Of_Birth")
                        .HasColumnType("datetime2");

                    b.Property<bool>("IsDelete")
                        .HasColumnType("bit");

                    b.Property<Guid>("PetBreed_ID")
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("Pet_FurColor")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Pet_FurType")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("Pet_Gender")
                        .HasColumnType("bit");

                    b.Property<string>("Pet_Image")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Pet_Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Pet_Note")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Pet_Weight")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Pet_ID");

                    b.HasIndex("PetBreed_ID");

                    b.ToTable("Pets");
                });

            modelBuilder.Entity("PetApi.Domain.Entities.PetBreed", b =>
                {
                    b.Property<Guid>("PetBreed_ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<bool>("IsDelete")
                        .HasColumnType("bit");

                    b.Property<string>("PetBreed_Description")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PetBreed_Image")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PetBreed_Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<Guid>("PetType_ID")
                        .HasColumnType("uniqueidentifier");

                    b.HasKey("PetBreed_ID");

                    b.HasIndex("PetType_ID");

                    b.ToTable("PetBreeds");
                });

            modelBuilder.Entity("PetApi.Domain.Entities.PetDiary", b =>
                {
                    b.Property<Guid>("Diary_ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("Category")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Diary_Content")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime>("Diary_Date")
                        .HasColumnType("datetime2");

                    b.Property<Guid>("Pet_ID")
                        .HasColumnType("uniqueidentifier");

                    b.HasKey("Diary_ID");

                    b.HasIndex("Pet_ID");

                    b.ToTable("PetDiarys");
                });

            modelBuilder.Entity("PetApi.Domain.Entities.PetType", b =>
                {
                    b.Property<Guid>("PetType_ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<bool>("IsDelete")
                        .HasColumnType("bit");

                    b.Property<string>("PetType_Description")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PetType_Image")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PetType_Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("PetType_ID");

                    b.ToTable("PetTypes");
                });

            modelBuilder.Entity("PetApi.Domain.Entities.Pet", b =>
                {
                    b.HasOne("PetApi.Domain.Entities.PetBreed", "PetBreed")
                        .WithMany("Pets")
                        .HasForeignKey("PetBreed_ID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("PetBreed");
                });

            modelBuilder.Entity("PetApi.Domain.Entities.PetBreed", b =>
                {
                    b.HasOne("PetApi.Domain.Entities.PetType", "PetType")
                        .WithMany("PetBreeds")
                        .HasForeignKey("PetType_ID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("PetType");
                });

            modelBuilder.Entity("PetApi.Domain.Entities.PetDiary", b =>
                {
                    b.HasOne("PetApi.Domain.Entities.Pet", "Pet")
                        .WithMany("PetDiaries")
                        .HasForeignKey("Pet_ID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Pet");
                });

            modelBuilder.Entity("PetApi.Domain.Entities.Pet", b =>
                {
                    b.Navigation("PetDiaries");
                });

            modelBuilder.Entity("PetApi.Domain.Entities.PetBreed", b =>
                {
                    b.Navigation("Pets");
                });

            modelBuilder.Entity("PetApi.Domain.Entities.PetType", b =>
                {
                    b.Navigation("PetBreeds");
                });
#pragma warning restore 612, 618
        }
    }
}
