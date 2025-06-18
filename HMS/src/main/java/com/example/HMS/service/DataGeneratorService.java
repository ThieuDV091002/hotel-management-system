package com.example.HMS.service; // Thay bằng package thực tế của bạn

import com.example.HMS.exception.DataIntegrityViolationException;
import com.example.HMS.model.*;
import com.example.HMS.repository.*;
import com.github.javafaker.Faker;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class DataGeneratorService {

    private final Faker faker = new Faker();
    private final EmployeeRepository employeeRepository;
    private final CustomerRepository customerRepository;
    private final LoyaltyLevelRepository loyaltyLevelRepository;
    private final PasswordEncoder passwordEncoder;
    private final AmenityRepository amenityRepository;
    private final RoomRepository roomRepository;
    private final RoomAmenityRepository roomAmenityRepository;
    private final AmenityHistoryRepository amenityHistoryRepository;
    private final AssetRepository assetRepository;
    private final ServiceRepository servicesRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryReceiptRepository inventoryReceiptRepository;
    private final InventoryReceiptDetailRepository inventoryReceiptDetailRepository;
    private final OperatingExpenseRepository operatingExpensesRepository;
    private final SalaryRepository salaryRepository;
    private final BookingsRepository bookingsRepository;
    private final RoomBookingsRepository roomBookingsRepository;
    private final FeedbackRepository feedbackRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final ServiceUsageRepository serviceUsageRepository;
    private final GuestRepository guestsRepository;
    private final HousekeepingRequestRepository housekeepingRequestRepository;
    private final FolioRepository folioRepository;
    private final FolioChargesRepository folioChargesRepository;
    private final WorkScheduleRepository workScheduleRepository;
    private final HousekeepingScheduleRepository housekeepingScheduleRepository;
    private final AuditReportRepository auditReportRepository;
    private final MaintenanceScheduleRepository maintenanceScheduleRepository;

    private Map<String, LoyaltyLevel> loyaltyLevelMap = new HashMap<>();

    // Danh sách hình ảnh cho từng RoomType
    private final Map<RoomType, List<String>> roomTypeImages = Map.of(
            RoomType.SINGLE, Arrays.asList("single_room_1.jpg", "single_room_2.jpg", "single_room_3.jpg", "single_room_4.jpeg", "single_room_5.jpg"),
            RoomType.DOUBLE, Arrays.asList("double_room_1.jpg", "double_room_2.jpg", "double_room_3.jpg", "double_room_4.jpg", "double_room_5.jpg"),
            RoomType.TWIN, Arrays.asList("twin_room_1.jpg", "twin_room_2.png", "twin_room_3.jpg", "twin_room_4.jpg", "twin_room_5.jpeg"),
            RoomType.DELUXE, Arrays.asList("deluxe_room_1.jpg", "deluxe_room_2.jpg", "deluxe_room_3.jpg", "deluxe_room_4.jpg", "deluxe_room_5.jpg"),
            RoomType.SUITE, Arrays.asList("suite_room_1.jpeg", "suite_room_2.jpg", "suite_room_3.jpg", "suite_room_4.jpg", "suite_room_5.jpeg"),
            RoomType.FAMILY, Arrays.asList("family_room_1.jpg", "family_room_2.jpeg", "family_room_3.jpg", "family_room_4.jpg", "family_room_5.jpg")
    );

    /**
     * Phương thức chính để tạo toàn bộ dữ liệu mẫu.
     */
    public void generateData() {
        createLoyaltyLevels();
        generateEmployees("RECEPTIONIST", 40);
        generateEmployees("HOUSEKEEPING", 80);
        generateEmployees("MAINTENANCE", 40);
        generateEmployees("WAITER", 60);
        generateEmployees("CHEF", 40);
        generateEmployees("SECURITY", 30);
        generateEmployees("POS_SERVICE", 35);
        generateAdmins(5);
        generateCustomers(500);

        List<Amenity> amenities = generateAmenities();
        List<Room> rooms = generateRooms(500);
        generateRoomAmenities(rooms, amenities);
        generateAmenityHistory(amenities, rooms, 1000);

        generateAssets(50);
        generateServices(10);
        List<Supplier> suppliers = generateSuppliers(10);
        List<Inventory> inventories = generateInventories(50, suppliers);
        generateInventoryReceipts(100, suppliers, inventories);
        generateOperatingExpenses(300);
        generateSalaries(3000);

        generateBookingData(500, 200, 300, 270, 1000, 200, 400);

        generateWorkSchedules(1000);
        generateHousekeepingSchedules(500);
        generateAuditReports(100);
        generateMaintenanceSchedules(300);
    }

    /**
     * Tạo các cấp độ loyalty và lưu vào cơ sở dữ liệu.
     */
    private void createLoyaltyLevels() {
        loyaltyLevelMap.put("BRONZE", saveLevel("BRONZE", 1000, "5% discount"));
        loyaltyLevelMap.put("SILVER", saveLevel("SILVER", 3000, "10% discount"));
        loyaltyLevelMap.put("GOLD", saveLevel("GOLD", 7000, "15% discount"));
        loyaltyLevelMap.put("PLATINUM", saveLevel("PLATINUM", 10000, "20% discount"));
    }

    private LoyaltyLevel saveLevel(String name, double required, String benefits) {
        return loyaltyLevelRepository.save(LoyaltyLevel.builder()
                .levelName(name)
                .pointsRequired(required)
                .benefits(benefits)
                .build());
    }

    /**
     * Tạo dữ liệu nhân viên theo vai trò và số lượng.
     */
    private void generateEmployees(String position, int count) {
        List<Employee> employees = new ArrayList<>();
        Role role = Role.valueOf(position.toUpperCase());

        for (int i = 0; i < count; i++) {
            Employee employee = Employee.builder()
                    .fullName(faker.name().fullName())
                    .username(position.toLowerCase() + i)
                    .password(passwordEncoder.encode("password"))
                    .email(faker.internet().emailAddress())
                    .phoneNumber(faker.phoneNumber().cellPhone())
                    .isActive(true)
                    .role(role)
                    .position(position.toLowerCase())
                    .salary(BigDecimal.valueOf(faker.number().numberBetween(5_000_000, 20_000_000)))
                    .hireDate(LocalDate.now().minusDays(faker.number().numberBetween(90, 1825)))
                    .build();
            employees.add(employee);
        }

        employeeRepository.saveAll(employees);
    }

    /**
     * Tạo tài khoản admin.
     */
    private void generateAdmins(int count) {
        List<Employee> admins = new ArrayList<>();

        for (int i = 0; i < count; i++) {
            Employee admin = Employee.builder()
                    .fullName(faker.name().fullName())
                    .username("admin" + i)
                    .password(passwordEncoder.encode("admin"))
                    .email(faker.internet().emailAddress())
                    .phoneNumber(faker.phoneNumber().cellPhone())
                    .isActive(true)
                    .role(Role.ADMIN)
                    .position("admin")
                    .salary(BigDecimal.valueOf(faker.number().numberBetween(15_000_000, 30_000_000)))
                    .hireDate(LocalDate.now().minusDays(faker.number().numberBetween(180, 1825)))
                    .build();
            admins.add(admin);
        }

        employeeRepository.saveAll(admins);
    }

    /**
     * Tạo dữ liệu khách hàng.
     */
    private void generateCustomers(int count) {
        List<Customer> customers = new ArrayList<>();

        for (int i = 0; i < count; i++) {
            double points = faker.number().randomDouble(2, 0, 10000);
            LoyaltyLevel level = determineLoyaltyLevel(points);

            Customer customer = Customer.builder()
                    .fullName(faker.name().fullName())
                    .username("customer" + i)
                    .password(passwordEncoder.encode("password"))
                    .email(faker.internet().emailAddress())
                    .phoneNumber(faker.phoneNumber().cellPhone())
                    .isActive(true)
                    .role(Role.CUSTOMER)
                    .address(faker.address().fullAddress())
                    .loyaltyPoints(points)
                    .loyaltyLevel(level)
                    .build();
            customers.add(customer);
        }

        customerRepository.saveAll(customers);
    }

    private LoyaltyLevel determineLoyaltyLevel(double points) {
        if (points >= 10000) return loyaltyLevelMap.get("PLATINUM");
        if (points >= 7000) return loyaltyLevelMap.get("GOLD");
        if (points >= 3000) return loyaltyLevelMap.get("SILVER");
        if (points >= 1000) return loyaltyLevelMap.get("BRONZE");
        return null;
    }

    /**
     * Tạo danh sách tiện nghi (Amenity) và lưu vào cơ sở dữ liệu.
     */
    private List<Amenity> generateAmenities() {
        List<String> amenityNames = Arrays.asList(
                "WiFi", "TV", "Air Conditioning", "Mini Bar", "Safe", "Hair Dryer", "Iron", "Coffee Maker",
                "Single Bed", "Double Bed", "Queen Bed", "King Bed", "Desk", "Chair", "Lamp"
        );
        List<Amenity> amenities = amenityNames.stream()
                .map(name -> Amenity.builder()
                        .name(name)
                        .description("Standard " + name + " for guest use.")
                        .build())
                .collect(Collectors.toList());
        return amenityRepository.saveAll(amenities);
    }

    /**
     * Tạo khoảng 500 phòng với các loại phòng, hình ảnh ngẫu nhiên, và giá VND.
     */
    private List<Room> generateRooms(int count) {
        Map<RoomType, Integer> typeCounts = Map.of(
                RoomType.SINGLE, 100,
                RoomType.DOUBLE, 150,
                RoomType.TWIN, 100,
                RoomType.DELUXE, 50,
                RoomType.SUITE, 50,
                RoomType.FAMILY, 50
        );
        List<Room> rooms = new ArrayList<>();
        int roomNumber = 1;
        for (Map.Entry<RoomType, Integer> entry : typeCounts.entrySet()) {
            RoomType type = entry.getKey();
            int num = entry.getValue();
            for (int i = 0; i < num; i++) {
                String roomName = type.toString() + " Room " + roomNumber;
                String description = "A comfortable " + type.toString().toLowerCase() + " room.";
                String price = getPriceForType(type);
                int capacity = getCapacityForType(type);
                RoomStatus status = getRandomStatus();
                // Chọn hình ảnh ngẫu nhiên từ danh sách của RoomType
                List<String> images = roomTypeImages.get(type);
                String image = images.get(faker.random().nextInt(images.size()));
                Room room = Room.builder()
                        .roomName(roomName)
                        .description(description)
                        .image(image)
                        .price(price)
                        .capacity(capacity)
                        .roomType(type)
                        .roomStatus(status)
                        .build();
                rooms.add(room);
                roomNumber++;
            }
        }
        return roomRepository.saveAll(rooms);
    }

    /**
     * Trả về giá phòng ngẫu nhiên theo VND, phù hợp với loại phòng.
     */
    private String getPriceForType(RoomType type) {
        switch (type) {
            case SINGLE:
                return String.valueOf(faker.number().numberBetween(500_000, 1_000_000));
            case DOUBLE:
                return String.valueOf(faker.number().numberBetween(800_000, 1_500_000));
            case TWIN:
                return String.valueOf(faker.number().numberBetween(900_000, 1_600_000));
            case DELUXE:
                return String.valueOf(faker.number().numberBetween(1_500_000, 2_500_000));
            case SUITE:
                return String.valueOf(faker.number().numberBetween(2_500_000, 4_000_000));
            case FAMILY:
                return String.valueOf(faker.number().numberBetween(2_000_000, 3_500_000));
            default:
                return "500000";
        }
    }

    /**
     * Trả về sức chứa của phòng dựa trên loại phòng.
     */
    private int getCapacityForType(RoomType type) {
        switch (type) {
            case SINGLE: return 1;
            case DOUBLE: return 2;
            case TWIN: return 2;
            case DELUXE: return 2;
            case SUITE: return 4;
            case FAMILY: return 6;
            default: return 2;
        }
    }

    /**
     * Chọn trạng thái phòng ngẫu nhiên.
     */
    private RoomStatus getRandomStatus() {
        RoomStatus[] statuses = RoomStatus.values();
        return statuses[faker.random().nextInt(statuses.length)];
    }

    /**
     * Gán tiện nghi cho các phòng dựa trên loại phòng.
     */
    private void generateRoomAmenities(List<Room> rooms, List<Amenity> amenities) {
        Map<String, Amenity> amenityMap = amenities.stream()
                .collect(Collectors.toMap(Amenity::getName, Function.identity()));
        List<RoomAmenity> roomAmenities = new ArrayList<>();
        for (Room room : rooms) {
            List<String> amenityNames = getAmenitiesForType(room.getRoomType());
            for (String name : amenityNames) {
                Amenity amenity = amenityMap.get(name);
                if (amenity != null) {
                    int quantity = getQuantityForAmenity(room.getRoomType(), name);
                    AmenityStatus status = faker.random().nextDouble() < 0.05 ? AmenityStatus.BROKEN : AmenityStatus.WORKING;
                    RoomAmenity ra = RoomAmenity.builder()
                            .room(room)
                            .amenity(amenity)
                            .status(status)
                            .quantity(quantity)
                            .build();
                    roomAmenities.add(ra);
                }
            }
        }
        roomAmenityRepository.saveAll(roomAmenities);
    }

    /**
     * Trả về danh sách tiện nghi phù hợp với loại phòng.
     */
    private List<String> getAmenitiesForType(RoomType type) {
        List<String> baseAmenities = Arrays.asList("WiFi", "TV", "Air Conditioning", "Desk", "Chair", "Lamp");
        switch (type) {
            case SINGLE:
                return Stream.concat(baseAmenities.stream(), Stream.of("Single Bed")).collect(Collectors.toList());
            case DOUBLE:
                return Stream.concat(baseAmenities.stream(), Stream.of("Double Bed")).collect(Collectors.toList());
            case TWIN:
                return Stream.concat(baseAmenities.stream(), Stream.of("Single Bed")).collect(Collectors.toList());
            case DELUXE:
                return Stream.concat(baseAmenities.stream(), Stream.of("Queen Bed", "Mini Bar", "Safe")).collect(Collectors.toList());
            case SUITE:
                return Stream.concat(baseAmenities.stream(), Stream.of("King Bed", "Mini Bar", "Safe", "Coffee Maker")).collect(Collectors.toList());
            case FAMILY:
                return Stream.concat(baseAmenities.stream(), Stream.of("Queen Bed")).collect(Collectors.toList());
            default:
                return baseAmenities;
        }
    }

    /**
     * Xác định số lượng tiện nghi dựa trên loại phòng và tên tiện nghi.
     */
    private int getQuantityForAmenity(RoomType type, String amenityName) {
        if (amenityName.equals("Chair") || amenityName.equals("Lamp")) {
            switch (type) {
                case SINGLE: return 1;
                case DOUBLE: return 2;
                case TWIN: return 2;
                case DELUXE: return 2;
                case SUITE: return 3;
                case FAMILY: return 4;
                default: return 1;
            }
        } else if (amenityName.endsWith("Bed")) {
            if (type == RoomType.TWIN && amenityName.equals("Single Bed")) return 2;
            if (type == RoomType.FAMILY && amenityName.equals("Queen Bed")) return 2;
            return 1;
        } else {
            return 1;
        }
    }

    /**
     * Tạo lịch sử tiện nghi (AmenityHistory) mô phỏng các hành động như chuyển, lấy từ kho, gửi vào kho.
     */
    private void generateAmenityHistory(List<Amenity> amenities, List<Room> rooms, int count) {
        List<AmenityHistory> histories = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            Amenity amenity = amenities.get(faker.random().nextInt(amenities.size()));
            AmenityAction action = AmenityAction.values()[faker.random().nextInt(AmenityAction.values().length)];
            Room sourceRoom = null;
            Room destinationRoom = null;
            if (action == AmenityAction.TRANSFER || action == AmenityAction.TO_STORAGE) {
                sourceRoom = rooms.get(faker.random().nextInt(rooms.size()));
            }
            if (action == AmenityAction.TRANSFER || action == AmenityAction.FROM_STORAGE) {
                destinationRoom = rooms.get(faker.random().nextInt(rooms.size()));
            }
            int quantity = faker.random().nextInt(1, 5);
            LocalDateTime timestamp = LocalDateTime.now().minusDays(faker.random().nextInt(365));
            AmenityHistory history = AmenityHistory.builder()
                    .amenity(amenity)
                    .action(action)
                    .sourceRoom(sourceRoom)
                    .destinationRoom(destinationRoom)
                    .quantity(quantity)
                    .timestamp(timestamp)
                    .build();
            histories.add(history);
        }
        amenityHistoryRepository.saveAll(histories);
    }

    /**
     * Tạo dữ liệu cho Asset.
     */
    private void generateAssets(int count) {
        List<Asset> assets = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            Asset asset = new Asset();
            asset.setName(faker.commerce().productName());
            asset.setLocation(faker.address().city());
            asset.setMaintainDate(faker.date().past(365, TimeUnit.DAYS));
            asset.setCondition(AssetCondition.values()[faker.random().nextInt(AssetCondition.values().length)]);
            assets.add(asset);
        }
        assetRepository.saveAll(assets);
    }

    /**
     * Tạo dữ liệu cho Services.
     */
    private void generateServices(int count) {
        List<Services> services = new ArrayList<>();
        List<String> serviceNames = Arrays.asList("Room Service", "Laundry", "Spa", "Gym", "Restaurant");
        for (int i = 0; i < count; i++) {
            Services service = new Services();
            service.setServiceName(serviceNames.get(i % serviceNames.size()));
            service.setServiceDescription(faker.lorem().sentence());
            service.setServicePrice(faker.number().randomDouble(2, 50_000, 500_000));
            service.setServiceType(faker.commerce().department());
            services.add(service);
        }
        servicesRepository.saveAll(services);
    }

    /**
     * Tạo dữ liệu cho Supplier.
     */
    private List<Supplier> generateSuppliers(int count) {
        List<Supplier> suppliers = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            Supplier supplier = new Supplier();
            supplier.setSupplierName(faker.company().name());
            supplier.setSupplierAddress(faker.address().fullAddress());
            supplier.setSupplierPhone(faker.phoneNumber().phoneNumber());
            suppliers.add(supplier);
        }
        return supplierRepository.saveAll(suppliers);
    }

    /**
     * Tạo dữ liệu cho Inventory, liên kết với Supplier.
     */
    private List<Inventory> generateInventories(int count, List<Supplier> suppliers) {
        List<Inventory> inventories = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            Inventory inventory = new Inventory();
            inventory.setInventoryName(faker.commerce().productName());
            inventory.setInventoryPrice(faker.number().randomDouble(2, 10_000, 1_000_000));
            inventory.setInventoryQuantity(faker.number().numberBetween(1, 100));
            inventory.setSupplier(suppliers.get(faker.random().nextInt(suppliers.size())));
            inventories.add(inventory);
        }
        return inventoryRepository.saveAll(inventories);
    }

    /**
     * Tạo dữ liệu cho InventoryReceipt và InventoryReceiptDetail.
     */
    private void generateInventoryReceipts(int count, List<Supplier> suppliers, List<Inventory> inventories) {
        for (int i = 0; i < count; i++) {
            InventoryReceipt receipt = new InventoryReceipt();
            receipt.setReceiptCode("IR-" + System.currentTimeMillis() + i);
            receipt.setReceiptDate(LocalDateTime.now().minusDays(faker.number().numberBetween(1, 30)));
            receipt.setSupplier(suppliers.get(faker.random().nextInt(suppliers.size())));
            receipt.setStatus("COMPLETED");

            List<InventoryReceiptDetail> details = new ArrayList<>();
            int detailCount = faker.number().numberBetween(1, 5);
            for (int j = 0; j < detailCount; j++) {
                InventoryReceiptDetail detail = new InventoryReceiptDetail();
                detail.setReceipt(receipt);
                detail.setInventory(inventories.get(faker.random().nextInt(inventories.size())));
                detail.setQuantity(faker.number().numberBetween(1, 20));
                detail.setUnitPrice(faker.number().randomDouble(2, 10_000, 1_000_000));
                details.add(detail);
            }
            receipt.setDetails(details);
            inventoryReceiptRepository.save(receipt);
        }
    }

    /**
     * Tạo dữ liệu cho OperatingExpenses.
     */
    private void generateOperatingExpenses(int count) {
        List<OperatingExpenses> expenses = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            OperatingExpenses expense = new OperatingExpenses();
            expense.setExpenseType(ExpenseType.values()[faker.random().nextInt(ExpenseType.values().length)]);
            expense.setStatus(ExpenseStatus.values()[faker.random().nextInt(ExpenseStatus.values().length)]);
            expense.setDescription(faker.lorem().sentence());
            expense.setAmount(faker.number().randomDouble(2, 100_000, 10_000_000));
            expense.setProvider(faker.company().name());
            expense.setDueDate(faker.date().future(30, TimeUnit.DAYS));
            expense.setCreatedAt(LocalDateTime.now().minusDays(faker.number().numberBetween(1, 30)));
            expenses.add(expense);
        }
        operatingExpensesRepository.saveAll(expenses);
    }

    /**
     * Tạo dữ liệu cho Salary, với amount lấy từ salary của Employee và đơn vị VND.
     */
    private void generateSalaries(int count) {
        List<Employee> employees = employeeRepository.findAll();
        if (employees.isEmpty()) {
            return;
        }
        List<Salary> salaries = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            Employee employee = employees.get(faker.random().nextInt(employees.size()));
            Salary salary = new Salary();
            salary.setEmployee(employee);
            salary.setPayTime(LocalDateTime.now().minusDays(faker.number().numberBetween(1, 30)));
            salary.setAmount(employee.getSalary().doubleValue());
            salary.setStatus(ExpenseStatus.values()[faker.random().nextInt(ExpenseStatus.values().length)]);
            salary.setCreatedAt(LocalDateTime.now().minusDays(faker.number().numberBetween(1, 30)));
            salaries.add(salary);
        }
        salaryRepository.saveAll(salaries);
    }

    /**
     * Tạo dữ liệu cho tất cả các entity liên quan đến booking.
     */
    public void generateBookingData(int bookingCount, int feedbackCount, int serviceRequestCount,
                                    int serviceUsageCount, int guestCount, int housekeepingRequestCount,
                                    int folioCount) {
        List<Customer> customers = customerRepository.findAll();
        List<Employee> receptionists = employeeRepository.findByRole(Role.RECEPTIONIST);
        List<Room> rooms = roomRepository.findAll();
        List<Services> services = servicesRepository.findAll();

        if (customers.isEmpty() || receptionists.isEmpty() || rooms.isEmpty() || services.isEmpty()) {
            return;
        }

        List<Bookings> bookingsList = generateBookings(bookingCount, customers, receptionists, rooms);
        generateRoomBookings(bookingsList, rooms);
        generateFeedbacks(feedbackCount, customers, bookingsList);
        generateServiceRequests(serviceRequestCount, bookingsList, services);
        generateServiceUsages(serviceUsageCount, bookingsList, services);
        generateGuests(guestCount, bookingsList, rooms);
        generateHousekeepingRequests(housekeepingRequestCount, rooms, customers);
        generateFolios(folioCount, bookingsList, customers, services);
    }

    private List<Bookings> generateBookings(int count, List<Customer> customers, List<Employee> receptionists, List<Room> rooms) {
        List<Bookings> bookings = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            Bookings booking = new Bookings();
            booking.setCustomer(customers.get(faker.random().nextInt(customers.size())));
            BookingSource source = BookingSource.values()[faker.random().nextInt(BookingSource.values().length)];
            booking.setSource(source);
            booking.setCreatedBy(source == BookingSource.ONLINE
                    ? booking.getCustomer()
                    : receptionists.get(faker.random().nextInt(receptionists.size())));
            booking.setStatus(BookingStatus.values()[faker.random().nextInt(BookingStatus.values().length)]);
            booking.setStartDate(faker.date().future(30, TimeUnit.DAYS));
            booking.setEndDate(faker.date().future(60, TimeUnit.DAYS));
            booking.setRoomType(RoomType.values()[faker.random().nextInt(RoomType.values().length)]);
            booking.setRoomNumber(faker.number().numberBetween(1, 100));
            booking.setAdultNumber(faker.number().numberBetween(1, 4));
            booking.setChildNumber(faker.number().numberBetween(0, 2));
            booking.setCheckInTime(LocalDateTime.now().plusDays(faker.number().numberBetween(1, 30)));
            booking.setCheckOutTime(booking.getCheckInTime().plusDays(faker.number().numberBetween(1, 7)));
            booking.setTotalPrice(0);
            bookings.add(booking);
        }
        return bookingsRepository.saveAll(bookings);
    }

    private void generateRoomBookings(List<Bookings> bookings, List<Room> rooms) {
        List<RoomBookings> roomBookings = new ArrayList<>();
        for (Bookings booking : bookings) {
            Room room = rooms.get(faker.random().nextInt(rooms.size()));
            RoomBookings roomBooking = new RoomBookings();
            roomBooking.setRoom(room);
            roomBooking.setBookings(booking);
            roomBookings.add(roomBooking);
            booking.getRoomBookings().add(roomBooking);
        }
        roomBookingsRepository.saveAll(roomBookings);
    }

    private void generateFeedbacks(int count, List<Customer> customers, List<Bookings> bookings) {
        List<Feedback> feedbacks = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            Feedback feedback = new Feedback();
            feedback.setCustomer((Customer) customers.get(faker.random().nextInt(customers.size())));
            feedback.setBooking(bookings.get(faker.random().nextInt(bookings.size())));
            feedback.setRating(faker.number().numberBetween(1, 6));
            feedback.setComment(faker.lorem().sentence());
            feedback.setDateTime(LocalDateTime.now().minusDays(faker.number().numberBetween(1, 30)));
            feedbacks.add(feedback);
        }
        feedbackRepository.saveAll(feedbacks);
    }

    private void generateServiceRequests(int count, List<Bookings> bookings, List<Services> services) {
        List<ServiceRequest> serviceRequests = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            ServiceRequest request = new ServiceRequest();
            request.setBooking(bookings.get(faker.random().nextInt(bookings.size())));
            Services service = services.get(faker.random().nextInt(services.size()));
            request.setService(service);
            request.setQuantity(faker.number().numberBetween(1, 5));
            request.setTotalAmount((double) (request.getQuantity() * service.getServicePrice()));
            request.setStatus(ServiceRequestStatus.values()[faker.random().nextInt(ServiceRequestStatus.values().length)]);
            request.setNotes(faker.lorem().sentence());
            serviceRequests.add(request);
        }
        serviceRequestRepository.saveAll(serviceRequests);
    }

    private void generateServiceUsages(int count, List<Bookings> bookings, List<Services> services) {
        List<ServiceUsage> serviceUsages = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            ServiceUsage usage = new ServiceUsage();
            Bookings booking = bookings.get(faker.random().nextInt(bookings.size()));
            usage.setBookings(booking);
            Services service = services.get(faker.random().nextInt(services.size()));
            usage.setServices(service);
            usage.setQuantity(faker.number().numberBetween(1, 5));
            usage.setTotalPrice(usage.getQuantity() * service.getServicePrice());
            usage.setTimestamp(LocalDateTime.now().minusDays(faker.number().numberBetween(1, 30)));
            serviceUsages.add(usage);
            booking.getServiceUsages().add(usage);
        }
        serviceUsageRepository.saveAll(serviceUsages);
    }

    private void generateGuests(int count, List<Bookings> bookings, List<Room> rooms) {
        List<Guests> guests = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            Guests guest = new Guests();
            guest.setBookings(bookings.get(faker.random().nextInt(bookings.size())));
            guest.setRoom(rooms.get(faker.random().nextInt(rooms.size())));
            guest.setGuestName(faker.name().fullName());
            guest.setGuestPhone(faker.phoneNumber().cellPhone());
            guest.setIdentification(faker.idNumber().ssnValid());
            guests.add(guest);
        }
        guestsRepository.saveAll(guests);
    }

    private void generateHousekeepingRequests(int count, List<Room> rooms, List<Customer> customers) {
        List<HousekeepingRequest> requests = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            HousekeepingRequest request = new HousekeepingRequest();
            request.setRoom(rooms.get(faker.random().nextInt(rooms.size())));
            request.setCustomer((Customer) customers.get(faker.random().nextInt(customers.size())));
            request.setStatus(HousekeepingStatus.values()[faker.random().nextInt(HousekeepingStatus.values().length)]);
            request.setNotes(faker.lorem().sentence());
            request.setPreferredTime(LocalDateTime.now().plusDays(faker.number().numberBetween(1, 7)));
            requests.add(request);
        }
        housekeepingRequestRepository.saveAll(requests);
    }

    private void generateFolios(int count, List<Bookings> bookings, List<Customer> customers, List<Services> services) {
        List<Folio> folios = new ArrayList<>();
        // Lấy danh sách bookings chưa được gán folio
        List<Bookings> availableBookings = new ArrayList<>(bookings);
        // Giới hạn số lượng folio theo số booking có sẵn
        int maxFolios = Math.min(count, availableBookings.size());

        for (int i = 0; i < maxFolios; i++) {
            Folio folio = new Folio();
            // Lấy một booking ngẫu nhiên và xóa khỏi danh sách để tránh trùng lặp
            Bookings booking = availableBookings.remove(faker.random().nextInt(availableBookings.size()));
            folio.setBookings(booking);
            folio.setUser(customers.get(faker.random().nextInt(customers.size())));
            folio.setTotalAmount(0.0);
            folio.setStatus(FolioStatus.values()[faker.random().nextInt(FolioStatus.values().length)]);
            folio.setCreatedAt(LocalDateTime.now().minusDays(faker.number().numberBetween(1, 30)));
            folio.setUpdatedAt(LocalDateTime.now());
            folios.add(folio);
        }

        try {
            folioRepository.saveAll(folios);
        } catch (DataIntegrityViolationException e) {
            System.err.println("Error saving folios: " + e.getMessage());
            throw e;
        }

        for (Folio folio : folios) {
            List<FolioCharges> charges = new ArrayList<>();
            Bookings booking = folio.getBookings();

            if (!booking.getRoomBookings().isEmpty()) {
                Room room = booking.getRoomBookings().get(0).getRoom();
                FolioCharges roomCharge = new FolioCharges();
                roomCharge.setFolio(folio);
                roomCharge.setChargeType("ROOM");
                roomCharge.setDescription("Room Charge for " + room.getRoomName());
                roomCharge.setItemName(room.getRoomType().toString());
                roomCharge.setQuantity(1);
                roomCharge.setUnitPrice(Double.parseDouble(room.getPrice()));
                roomCharge.setTotalPrice(roomCharge.getUnitPrice());
                roomCharge.setChargeTime(LocalDateTime.now());
                charges.add(roomCharge);
            }

            if (!booking.getServiceUsages().isEmpty()) {
                for (ServiceUsage usage : booking.getServiceUsages()) {
                    FolioCharges serviceCharge = new FolioCharges();
                    serviceCharge.setFolio(folio);
                    serviceCharge.setChargeType("SERVICE");
                    serviceCharge.setDescription("Service: " + usage.getServices().getServiceName());
                    serviceCharge.setItemName(usage.getServices().getServiceName());
                    serviceCharge.setQuantity(usage.getQuantity());
                    serviceCharge.setUnitPrice(usage.getServices().getServicePrice());
                    serviceCharge.setTotalPrice(usage.getTotalPrice());
                    serviceCharge.setChargeTime(usage.getTimestamp());
                    charges.add(serviceCharge);
                }
            }

            folioChargesRepository.saveAll(charges);

            double totalAmount = charges.stream().mapToDouble(FolioCharges::getTotalPrice).sum();
            folio.setTotalAmount(totalAmount);
            booking.setTotalPrice((int) totalAmount);
            folioRepository.save(folio);
            bookingsRepository.save(booking);
        }
    }

    /**
     * Tạo dữ liệu cho WorkSchedule.
     */
    private void generateWorkSchedules(int count) {
        List<Employee> employees = employeeRepository.findAll();
        if (employees.isEmpty()) {
            return;
        }
        List<WorkSchedule> workSchedules = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            WorkSchedule schedule = new WorkSchedule();
            schedule.setEmployee(employees.get(faker.random().nextInt(employees.size())));
            schedule.setDate(LocalDate.now().plusDays(faker.number().numberBetween(1, 30)));
            schedule.setShift(faker.options().option("Morning", "Afternoon", "Night"));
            workSchedules.add(schedule);
        }
        workScheduleRepository.saveAll(workSchedules);
    }

    /**
     * Tạo dữ liệu cho HousekeepingSchedule.
     */
    private void generateHousekeepingSchedules(int count) {
        List<Employee> housekeepers = employeeRepository.findByRole(Role.HOUSEKEEPING);
        List<Room> rooms = roomRepository.findAll();
        if (housekeepers.isEmpty() || rooms.isEmpty()) {
            return;
        }
        List<HousekeepingSchedule> schedules = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            HousekeepingSchedule schedule = new HousekeepingSchedule();
            schedule.setEmployee(housekeepers.get(faker.random().nextInt(housekeepers.size())));
            schedule.setRoom(rooms.get(faker.random().nextInt(rooms.size())));
            schedule.setScheduledTime(LocalDateTime.now().plusDays(faker.number().numberBetween(1, 7)));
            schedule.setStatus(ScheduleStatus.values()[faker.random().nextInt(ScheduleStatus.values().length)]);
            schedules.add(schedule);
        }
        housekeepingScheduleRepository.saveAll(schedules);
    }

    /**
     * Tạo dữ liệu cho AuditReport.
     */
    private void generateAuditReports(int count) {
        List<AuditReport> reports = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            AuditReport report = new AuditReport();
            report.setReportDate(LocalDate.now().minusDays(faker.number().numberBetween(1, 30)));
            report.setNumberOfBookings(faker.number().numberBetween(50, 200));
            report.setCheckIns(faker.number().numberBetween(20, 100));
            report.setCheckOuts(faker.number().numberBetween(20, 100));
            report.setRevenue(faker.number().randomDouble(2, 10_000_000, 100_000_000));
            report.setExpenses(faker.number().randomDouble(2, 5_000_000, 50_000_000));
            report.setOccupancyRate(faker.number().randomDouble(2, 50, 100));
            report.setRoomCapacity(faker.number().numberBetween(100, 500));
            report.setAdr(faker.number().randomDouble(2, 500_000, 2_000_000));
            report.setRevPar(faker.number().randomDouble(2, 300_000, 1_500_000));
            report.setCreatedAt(LocalDateTime.now().minusDays(faker.number().numberBetween(1, 30)));
            reports.add(report);
        }
        auditReportRepository.saveAll(reports);
    }

    /**
     * Tạo dữ liệu cho MaintenanceSchedule.
     */
    private void generateMaintenanceSchedules(int count) {
        List<Employee> maintenanceStaff = employeeRepository.findByRole(Role.MAINTENANCE);
        List<Room> rooms = roomRepository.findAll();
        List<Asset> assets = assetRepository.findAll();
        if (maintenanceStaff.isEmpty() || (rooms.isEmpty() && assets.isEmpty())) {
            return;
        }
        List<MaintenanceSchedule> schedules = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            MaintenanceSchedule schedule = new MaintenanceSchedule();
            if (faker.random().nextBoolean() && !assets.isEmpty()) {
                schedule.setAsset(assets.get(faker.random().nextInt(assets.size())));
            } else if (!rooms.isEmpty()) {
                schedule.setRoom(rooms.get(faker.random().nextInt(rooms.size())));
            }
            schedule.setScheduledDate(LocalDateTime.now().plusDays(faker.number().numberBetween(1, 30)));
            schedule.setDescription(faker.lorem().sentence());
            schedule.setStatus(ScheduleStatus.values()[faker.random().nextInt(ScheduleStatus.values().length)]);
            int employeeCount = faker.number().numberBetween(1, 3);
            Set<Employee> assignedEmployees = new HashSet<>();
            for (int j = 0; j < employeeCount; j++) {
                assignedEmployees.add(maintenanceStaff.get(faker.random().nextInt(maintenanceStaff.size())));
            }
            schedule.setEmployees(assignedEmployees);
            schedules.add(schedule);
        }
        maintenanceScheduleRepository.saveAll(schedules);
    }
}