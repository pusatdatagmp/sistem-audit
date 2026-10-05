import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
    permissions: string[];
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SystemSettings {
    logo_url: string | null;
    primary_color: string | null;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    flash: { success?: string | null };
    systemSettings: SystemSettings;
    [key: string]: unknown;
}

export interface Role {
    id: number;
    code: string;
    name: string;
    description?: string | null;
    is_locked?: boolean;
    users_count?: number;
    permissions_count?: number;
    permissions?: Permission[];
}

export interface Permission {
    id: number;
    code: string;
    name: string;
    group: string;
    description?: string | null;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
    kitchen_id?: number | null;
    kitchen?: Kitchen | null;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

export interface MasterDataOption {
    id: number;
    code: string;
    label: string;
    description?: string | null;
    sort_order?: number;
    is_active?: boolean;
}

export interface MasterDataGroup {
    id: number;
    code: string;
    name: string;
    description?: string | null;
    is_locked: boolean;
    options_count?: number;
}

export interface Kitchen {
    id: number;
    name: string;
    code?: string;
    address?: string | null;
    pic_name?: string | null;
    phone?: string | null;
    is_active?: boolean;
}

export interface KitchenTool {
    id: number;
    code: string;
    name: string;
    unit: string;
    is_active?: boolean;
    category?: MasterDataOption;
    category_option_id?: number;
    description?: string | null;
}

export interface KitchenInventory {
    id: number;
    kitchen_id: number;
    kitchen_tool_id: number;
    quantity_good: number;
    quantity_needs_repair: number;
    quantity_damaged: number;
    kitchen: Kitchen;
    kitchen_tool: KitchenTool;
}

export interface InventoryLog {
    id: number;
    type: 'in' | 'out' | 'transfer_in' | 'transfer_out' | 'opname';
    quantity_change: number;
    stock_before: number;
    stock_after: number;
    note: string | null;
    created_at: string;
    condition: MasterDataOption | null;
    related_kitchen: Kitchen | null;
    performed_by: User;
    kitchen_inventory: KitchenInventory;
}

export interface Vehicle {
    id: number;
    plate_number: string;
    brand: string | null;
    model: string | null;
    year: number | null;
    is_active: boolean;
    vehicle_type_option_id?: number;
    status_option_id?: number;
    home_kitchen_id?: number | null;
    vehicle_type?: MasterDataOption;
    status?: MasterDataOption;
    home_kitchen?: Kitchen | null;
}

export interface VehicleMaintenanceSchedule {
    id: number;
    scheduled_date: string;
    odometer_at_schedule: number | null;
    completed_at: string | null;
    notes: string | null;
    maintenance_type_option_id?: number;
    status_option_id?: number;
    vehicle: Vehicle;
    maintenance_type?: MasterDataOption;
    status?: MasterDataOption;
}

export interface VehicleUsageLog {
    id: number;
    usage_date: string;
    start_odometer: number | null;
    end_odometer: number | null;
    destination: string | null;
    purpose: string | null;
    vehicle: Vehicle;
    driver: User;
    kitchen: Kitchen | null;
}

export interface VehicleInspectionItem {
    id: number;
    component_option_id: number;
    condition_option_id: number;
    notes: string | null;
    component: MasterDataOption;
    condition: MasterDataOption;
}

export interface VehicleInspection {
    id: number;
    inspected_at: string;
    odometer: number | null;
    notes: string | null;
    vehicle: Vehicle;
    inspected_by: User;
    items: VehicleInspectionItem[];
}

export interface ComplaintTicketUpdate {
    id: number;
    status_from: string | null;
    status_to: string | null;
    note: string | null;
    created_at: string;
    user: User;
}

export interface ComplaintTicket {
    id: number;
    ticket_number: string;
    status: 'open' | 'in_progress' | 'resolved';
    subject: string;
    description: string;
    photo_url: string | null;
    resolved_at: string | null;
    created_at: string;
    kitchen_id?: number | null;
    category_option_id?: number;
    priority_option_id?: number;
    related_kitchen_tool_id?: number | null;
    related_vehicle_id?: number | null;
    reporter: User;
    kitchen: Kitchen | null;
    category: MasterDataOption;
    priority: MasterDataOption;
    related_kitchen_tool: KitchenTool | null;
    related_vehicle: Vehicle | null;
    assigned_to: User | null;
    updates?: ComplaintTicketUpdate[];
}

export interface EquipmentRequest {
    id: number;
    kitchen_id: number;
    kitchen_tool_id: number | null;
    new_tool_name: string | null;
    new_tool_unit: string | null;
    new_tool_category_option_id: number | null;
    quantity: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    review_note: string | null;
    reviewed_at: string | null;
    created_at: string;
    kitchen: Kitchen;
    kitchen_tool: KitchenTool | null;
    new_tool_category: MasterDataOption | null;
    requested_by: User;
    reviewed_by: User | null;
}
