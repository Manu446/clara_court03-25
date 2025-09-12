generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int       @id @default(autoincrement())
  name      String
  email     String    @unique
  password  String
  role      String    @default("tenant") // tenant | admin
  bookings  Booking[]
  createdAt DateTime  @default(now())
}

model Apartment {
  id          Int       @id @default(autoincrement())
  name        String
  description String?
  price       Float
  status      String    @default("available") // available | booked
  bookings    Booking[]
  createdAt   DateTime  @default(now())
}

model Booking {
  id           Int       @id @default(autoincrement())
  userId       Int
  apartmentId  Int
  startDate    DateTime
  endDate      DateTime
  status       String    @default("pending") // pending | confirmed | cancelled
  payment      Payment?
  createdAt    DateTime  @default(now())

  user        User       @relation(fields: [userId], references: [id])
  apartment   Apartment  @relation(fields: [apartmentId], references: [id])
}

model Payment {
  id         Int       @id @default(autoincrement())
  bookingId  Int       @unique
  amount     Float
  method     String    // e.g. "mpesa", "card", "cash"
  status     String    @default("pending") // pending | paid | failed
  createdAt  DateTime  @default(now())

  booking    Booking   @relation(fields: [bookingId], references: [id])
}
