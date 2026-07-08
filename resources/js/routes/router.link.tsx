import { lazy } from "react";
import { Navigate, Route } from "react-router";
import { all_routes } from "./all_routes";
const Login = lazy(() => import("../feature-module/Authentication/login/login"));
const Contacts = lazy(() => import("../feature-module/Pages/crm-module/contacts/contacts"));
const UiAccordion = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiAccordion"));
const UiAlerts = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiAlerts"));
const UiAvatar = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiAvatar"));
const UiBadges = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiBadges"));
const UiBreadcrumb = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiBreadcrumb"));
const UiButtons = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiButtons"));
const UiButtonsGroup = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiButtonsGroup"));
const UiCards = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiCards"));
const UiCarousel = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiCarousel"));
const UiCollapse = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiCollapse"));
const UiDropdowns = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiDropdowns"));
const UiGrid = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiGrid"));
const UiRatio = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiRatio"));
const UiImages = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiImages"));
const UiLinks = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiLinks"));
const UiListGroup = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiListGroup"));
const UiModals = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiModals"));
const UiOffcanvas = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiOffcanvas"));
const UiPagination = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiPagination"));
const UiPlaceholders = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiPlaceholders"));
const UiPopovers = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiPopovers"));
const UiProgress = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiProgress"));
const UiSpinner = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiSpinner"));
const UiNavTabs = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiNavTabs"));
const UiToasts = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiToasts"));
const UiTooltips = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiTooltips"));
const UiTypography = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiTypography"));
const UiUtilities = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiUtilities"));
const UiDragula = lazy(() => import("../feature-module/Pages/ui-module/ui-advance/dragula/dragula"));
const UiClipBoard = lazy(() => import("../feature-module/Pages/ui-module/ui-advance/uiClipboard"));
const UiRangeSlides = lazy(() => import("../feature-module/Pages/ui-module/ui-advance/uiRangeslider"));
const UiLightboxes = lazy(() => import("../feature-module/Pages/ui-module/ui-advance/uiLightbox"));
const UiRating = lazy(() => import("../feature-module/Pages/ui-module/ui-advance/uiRating"));
const UiScrollbar = lazy(() => import("../feature-module/Pages/ui-module/ui-advance/uiScrollbar"));
const UiScrollspy = lazy(() => import("../feature-module/Pages/ui-module/base-ui/uiScrollspy"));
const FormBasicInputs = lazy(() => import("../feature-module/Pages/ui-module/forms/form-elements/formBasicInputs"));
const FormCheckboxRadios = lazy(() => import("../feature-module/Pages/ui-module/forms/form-elements/formCheckboxRadios"));
const FormInputGroups = lazy(() => import("../feature-module/Pages/ui-module/forms/form-elements/formInputGroups"));
const FormGridGutters = lazy(() => import("../feature-module/Pages/ui-module/forms/form-elements/formGridGutters"));
const FormMask = lazy(() => import("../feature-module/Pages/ui-module/forms/input-masks/inputMasks"));
const FormFileupload = lazy(() => import("../feature-module/Pages/ui-module/forms/form-elements/formFileupload"));
const FormHorizontal = lazy(() => import("../feature-module/Pages/ui-module/forms/form-layouts/formHorizontal"));
const FormVertical = lazy(() => import("../feature-module/Pages/ui-module/forms/form-layouts/formVertical"));
const FormFloatingLabels = lazy(() => import("../feature-module/Pages/ui-module/forms/form-layouts/formFloatingLabels"));
const FormValidation = lazy(() => import("../feature-module/Pages/ui-module/forms/form-validation/formValidation"));

const FormWizard = lazy(() => import("../feature-module/Pages/ui-module/forms/form-wizard/formWizard"));
const FormPickers = lazy(() => import("../feature-module/Pages/ui-module/forms/form-pickers/formPickers"));
const TablesBasic = lazy(() => import("../feature-module/Pages/ui-module/table/tables-basic"));
const DataTables = lazy(() => import("../feature-module/Pages/ui-module/table/data-tables"));
const ChartApex = lazy(() => import("../feature-module/Pages/ui-module/charts/apexcharts"));
const IconBootstrap = lazy(() => import("../feature-module/Pages/ui-module/icons/iconBootstrap"));
const IconFlag = lazy(() => import("../feature-module/Pages/ui-module/icons/iconFlag"));
const IconFontawesome = lazy(() => import("../feature-module/Pages/ui-module/icons/iconFontawesome"));
const IconIonic = lazy(() => import("../feature-module/Pages/ui-module/icons/iconIonic"));
const IconMaterial = lazy(() => import("../feature-module/Pages/ui-module/icons/iconMaterial"));
const IconPe7 = lazy(() => import("../feature-module/Pages/ui-module/icons/iconPe7"));
const IconRemix = lazy(() => import("../feature-module/Pages/ui-module/icons/iconRemix"));
const IconTabler = lazy(() => import("../feature-module/Pages/ui-module/icons/iconTabler"));
const IconThemify = lazy(() => import("../feature-module/Pages/ui-module/icons/iconThemify"));
const IconTypicon = lazy(() => import("../feature-module/Pages/ui-module/icons/iconTypicon"));
const IconWeather = lazy(() => import("../feature-module/Pages/ui-module/icons/iconWeather"));
const DelasDashboard = lazy(() => import("../feature-module/Pages/dashboard/deals-dashboard/delasDashboard"));
const ContactsList = lazy(() => import("../feature-module/Pages/crm-module/contacts/contactsList"));
const Chat = lazy(() => import("../feature-module/Pages/application-module/chat/chat"));
const VideoCall = lazy(() => import("../feature-module/Pages/application-module/chat/calls/videoCall"));
const AudioCall = lazy(() => import("../feature-module/Pages/application-module/chat/calls/audioCall"));
const CallHistory = lazy(() => import("../feature-module/Pages/application-module/chat/calls/callHistory"));
const Calender = lazy(() => import("../feature-module/Pages/application-module/calendar/calendar"));
const Email = lazy(() => import("../feature-module/Pages/application-module/email/email"));
const EmailReply = lazy(() => import("../feature-module/Pages/application-module/email/emailReply"));
const Todo = lazy(() => import("../feature-module/Pages/application-module/todo/todo"));
const TodoList = lazy(() => import("../feature-module/Pages/application-module/todo/todoList"));
const Notes = lazy(() => import("../feature-module/Pages/application-module/notes/notes"));
const FileManager = lazy(() => import("../feature-module/Pages/application-module/file-manager/fileManager"));
const SocialFeed = lazy(() => import("../feature-module/Pages/application-module/social-feed/socialFeed"));
const KanbanView = lazy(() => import("../feature-module/Pages/application-module/kanban-view/kanbanView"));
const Invoice = lazy(() => import("../feature-module/Pages/application-module/invoice/invoice"));
const AddInoivce = lazy(() => import("../feature-module/Pages/application-module/invoice/add-invoice/addInoivce"));
const EditInoivce = lazy(() => import("../feature-module/Pages/application-module/invoice/edit-invoice/editInoivce"));
const InvoiceDetails = lazy(() => import("../feature-module/Pages/application-module/invoice/invoiceDetails"));
const Register = lazy(() => import("../feature-module/Authentication/register/register"));
const ResetPassword = lazy(() => import("../feature-module/Authentication/reset-password/resetPassword"));
const ForgotPassword = lazy(() => import("../feature-module/Authentication/forgot-password/forgotPassword"));
const EmailVerification = lazy(() => import("../feature-module/Authentication/email-verification/emailVerification"));
const TwoStepVerification = lazy(() => import("../feature-module/Authentication/two-step-verification/twoStepVerification"));
const LockScreen = lazy(() => import("../feature-module/Authentication/lock-screen/lockScreen"));
const Error403 = lazy(() => import("../feature-module/Authentication/error-403/error403"));
const Error404 = lazy(() => import("../feature-module/Authentication/error-404/error404"));
const Error500 = lazy(() => import("../feature-module/Authentication/error-500/error500"));
const BlankPage = lazy(() => import("../feature-module/Authentication/blank-page/blankPage"));
const ComingSoon = lazy(() => import("../feature-module/Authentication/coming-soon/comingSoon"));
const UnderMaintenance = lazy(() => import("../feature-module/Authentication/under-maintenance/underMaintenance"));
const LeadsDashboard = lazy(() => import("../feature-module/Pages/dashboard/leads-dashboard/leadsDashboard"));
const ProjectDashboard = lazy(() => import("../feature-module/Pages/dashboard/project-dashboard/projectDashboard"));
const ContactsDetails = lazy(() => import("../feature-module/Pages/crm-module/contacts/contactsDetails"));
const CompaniesGrid = lazy(() => import("../feature-module/Pages/crm-module/companies/companiesGrid"));
const CompaniesList = lazy(() => import("../feature-module/Pages/crm-module/companies/companiesList"));
const CompaniesDetails = lazy(() => import("../feature-module/Pages/crm-module/companies/companiesDetails"));
const DealsGrid = lazy(() => import("../feature-module/Pages/crm-module/deals/dealsGrid"));
const DealsList = lazy(() => import("../feature-module/Pages/crm-module/deals/dealsList"));
const DealsDetails = lazy(() => import("../feature-module/Pages/crm-module/deals/dealsDetails"));
const Leads = lazy(() => import("../feature-module/Pages/crm-module/leads/leads"));
const LeadsList = lazy(() => import("../feature-module/Pages/crm-module/leads/leadsList"));
const LeadsDetails = lazy(() => import("../feature-module/Pages/crm-module/leads/leadsDetails"));
const Pipeline = lazy(() => import("../feature-module/Pages/crm-module/pipeline/pipeline"));
const Campaign = lazy(() => import("../feature-module/Pages/crm-module/campaign/campaign"));
const CampaignComplete = lazy(() => import("../feature-module/Pages/crm-module/campaign/campaignComplete"));
const CampaignArchieve = lazy(() => import("../feature-module/Pages/crm-module/campaign/campaignArchieve"));
const ProjectsGrid = lazy(() => import("../feature-module/Pages/crm-module/projects/projectsGrid"));
const ProjectsList = lazy(() => import("../feature-module/Pages/crm-module/projects/projectsList"));
const Tasks = lazy(() => import("../feature-module/Pages/crm-module/tasks/tasks"));
const ProjectDetails = lazy(() => import("../feature-module/Pages/crm-module/projects/projectDetails"));
const TasksImportant = lazy(() => import("../feature-module/Pages/crm-module/tasks/tasksImportant"));
const Taskscompleted = lazy(() => import("../feature-module/Pages/crm-module/tasks/tasksCompleted"));
const Proposals = lazy(() => import("../feature-module/Pages/crm-module/proposals/proposals"));
const ProposalList = lazy(() => import("../feature-module/Pages/crm-module/proposals/proposalList"));
const Contracts = lazy(() => import("../feature-module/Pages/crm-module/contracts/contracts"));
const ContractsList = lazy(() => import("../feature-module/Pages/crm-module/contracts/contractsList"));
const Estimations = lazy(() => import("../feature-module/Pages/crm-module/estimations/estimations"));
const EstimationsList = lazy(() => import("../feature-module/Pages/crm-module/estimations/estimationsList"));
const InvoicesGrid    = lazy(() => import("../feature-module/Pages/crm-module/invoices/invoicesGrid"));
const InvoicesList    = lazy(() => import("../feature-module/Pages/crm-module/invoices/invoicesList"));
const NewInvoice      = lazy(() => import("../feature-module/Pages/crm-module/invoices/newInvoice"));
const InvoiceOverview = lazy(() => import("../feature-module/Pages/crm-module/invoices/invoiceOverview"));
const RecordPayment       = lazy(() => import("../feature-module/Pages/crm-module/invoices/recordPayment"));
const NewCreditNote       = lazy(() => import("../feature-module/Pages/crm-module/invoices/newCreditNote"));
const CreditNotesList     = lazy(() => import("../feature-module/Pages/crm-module/invoices/creditNotes"));
const CreditNoteOverview  = lazy(() => import("../feature-module/Pages/crm-module/invoices/creditNoteOverview"));
const Payments            = lazy(() => import("../feature-module/Pages/crm-module/payments/payments"));
const NewPayment      = lazy(() => import("../feature-module/Pages/crm-module/payments/newPayment"));
const PaymentOverview = lazy(() => import("../feature-module/Pages/crm-module/payments/paymentOverview"));
const PaymentRefund   = lazy(() => import("../feature-module/Pages/crm-module/payments/paymentRefund"));
const Analytics = lazy(() => import("../feature-module/Pages/crm-module/analytics/analytics"));
const Activities = lazy(() => import("../feature-module/Pages/crm-module/activities/activities"));
const LeadReports = lazy(() => import("../feature-module/Pages/reports/lead-reports/leadReports"));
const DealReports = lazy(() => import("../feature-module/Pages/reports/deal-reports/dealReports"));
const ContactReports = lazy(() => import("../feature-module/Pages/reports/contact-reports/contactReports"));
const CompanyReports = lazy(() => import("../feature-module/Pages/reports/company-reports/companyReports"));
const ProjectReports = lazy(() => import("../feature-module/Pages/reports/project-reports/projectReports"));
const TaskReports = lazy(() => import("../feature-module/Pages/reports/task-reports/taskReports"));
const Sources = lazy(() => import("../feature-module/Pages/crm-settings/sources/sources"));
const LostReason = lazy(() => import("../feature-module/Pages/crm-settings/lost-reason/lostReason"));
const ActivityCalls = lazy(() => import("../feature-module/Pages/crm-module/activities/activity-calls"));
const ActivityMails = lazy(() => import("../feature-module/Pages/crm-module/activities/activity-mail"));
const ActivityTasks = lazy(() => import("../feature-module/Pages/crm-module/activities/activity-task"));
const ActivityMeetings = lazy(() => import("../feature-module/Pages/crm-module/activities/activity-meeting"));
const ContactStage = lazy(() => import("../feature-module/Pages/crm-settings/contact-stage/contactStage"));
const Industry = lazy(() => import("../feature-module/Pages/crm-settings/industry/industry"));
const Calls = lazy(() => import("../feature-module/Pages/crm-settings/calls/calls"));
const ManageUsers  = lazy(() => import("../feature-module/Pages/user-management/manage-users/manageUsers"));
const NewUser      = lazy(() => import("../feature-module/Pages/user-management/manage-users/newUser"));
const EditUser     = lazy(() => import("../feature-module/Pages/user-management/manage-users/editUser"));
const UserOverview = lazy(() => import("../feature-module/Pages/user-management/manage-users/userOverview"));
const RolesPermissions = lazy(() => import("../feature-module/Pages/user-management/roles-permissions/rolesPermissions"));
const NewRole          = lazy(() => import("../feature-module/Pages/user-management/roles-permissions/newRole"));
const RoleOverview     = lazy(() => import("../feature-module/Pages/user-management/roles-permissions/roleOverview"));
const EditRole         = lazy(() => import("../feature-module/Pages/user-management/roles-permissions/editRole"));
const Permission = lazy(() => import("../feature-module/Pages/user-management/permission/permission"));
const DeleteRequest = lazy(() => import("../feature-module/Pages/user-management/delete-request/deleteRequest"));
const MembershipPlans = lazy(() => import("../feature-module/Pages/membership/membership-plans/membershipPlans"));
const MembershipAddons = lazy(() => import("../feature-module/Pages/membership/membership-addons/membershipAddons"));
const MembershipTransactions = lazy(() => import("../feature-module/Pages/membership/membership-transactions/membershipTransactions"));
const Page = lazy(() => import("../feature-module/Pages/content/page"));
const AddPage = lazy(() => import("../feature-module/Pages/content/addPage"));
const EditPage = lazy(() => import("../feature-module/Pages/content/editPage"));
const Blogs = lazy(() => import("../feature-module/Pages/content/blogs/blogs"));
const Addblog = lazy(() => import("../feature-module/Pages/content/blogs/addblog"));
const Editblog = lazy(() => import("../feature-module/Pages/content/blogs/editblog"));
const BlogDetails = lazy(() => import("../feature-module/Pages/content/blogs/blogDetails"));
const BlogCategories = lazy(() => import("../feature-module/Pages/content/blogs/blogCategories"));
const BlogComments = lazy(() => import("../feature-module/Pages/content/blogs/blogComments"));
const BlogTags = lazy(() => import("../feature-module/Pages/content/blogs/blogTags"));
const Countries = lazy(() => import("../feature-module/Pages/content/location/countries"));
const States = lazy(() => import("../feature-module/Pages/content/location/states"));
const Cities = lazy(() => import("../feature-module/Pages/content/location/cities"));
const Testimonials = lazy(() => import("../feature-module/Pages/content/testimonials"));
const Faq = lazy(() => import("../feature-module/Pages/content/faq"));
const ContactMessages = lazy(() => import("../feature-module/Pages/support/contact-messages/contactMessages"));
const Tickets = lazy(() => import("../feature-module/Pages/support/tickets/tickets"));
const TicketDetails = lazy(() => import("../feature-module/Pages/support/tickets/ticketDetails"));
const ProfileSettings = lazy(() => import("../feature-module/Pages/profile/Profile"));
const SecuritySettings = lazy(() => import("../feature-module/Pages/settings/general-settings/securitySettings"));
const NotificationsSettings = lazy(() => import("../feature-module/Pages/settings/general-settings/notificationsSettings"));
const ConnectedApps = lazy(() => import("../feature-module/Pages/settings/general-settings/connectedApps"));
const CompanySettings = lazy(() => import("../feature-module/Pages/settings/website-settings/companySettings"));
const LocalizationSettings = lazy(() => import("../feature-module/Pages/settings/website-settings/localizationSettings"));
const PrefixesSettings = lazy(() => import("../feature-module/Pages/settings/website-settings/prefixesSettings"));
const PreferenceSettings = lazy(() => import("../feature-module/Pages/settings/website-settings/preferenceSettings"));
const AppearanceSettings = lazy(() => import("../feature-module/Pages/settings/website-settings/appearanceSettings"));
const LanguageSettings = lazy(() => import("../feature-module/Pages/settings/website-settings/languageSettings"));
const SettingsHome = lazy(() => import("../feature-module/Pages/settings/settingsHome"));
const InvoiceSettings = lazy(() => import("../feature-module/Pages/settings/app-settings/invoiceSettings"));
const PrintersSettings = lazy(() => import("../feature-module/Pages/settings/app-settings/printersSettings"));
const CustomFieldsSetting = lazy(() => import("../feature-module/Pages/settings/app-settings/customFieldsSetting"));
const ProjectSettings = lazy(() => import("../feature-module/Pages/settings/app-settings/productSettings"));
const CustomerSettings = lazy(() => import("../feature-module/Pages/settings/app-settings/customerSettings"));
const PaymentReceivedSettings = lazy(() => import("../feature-module/Pages/settings/app-settings/paymentReceivedSettings"));
const AddCustomField = lazy(() => import("../feature-module/Pages/settings/app-settings/addCustomField"));
const InventoryList = lazy(() => import("../feature-module/Pages/inventory/inventoryList"));
const AssembliesList   = lazy(() => import("../feature-module/Pages/inventory/assemblies/assembliesList"));
const AssemblyOverview = lazy(() => import("../feature-module/Pages/inventory/assemblies/assemblyOverview"));
const NewAssembly      = lazy(() => import("../feature-module/Pages/inventory/assemblies/newAssembly"));
const InventoryAdjustmentsList     = lazy(() => import("../feature-module/Pages/inventory/adjustments/inventoryAdjustmentsList"));
const NewInventoryAdjustment       = lazy(() => import("../feature-module/Pages/inventory/adjustments/newInventoryAdjustment"));
const InventoryAdjustmentOverview  = lazy(() => import("../feature-module/Pages/inventory/adjustments/inventoryAdjustmentOverview"));
const TransferOrdersList           = lazy(() => import("../feature-module/Pages/inventory/transferOrders/transferOrdersList"));
const NewTransferOrder             = lazy(() => import("../feature-module/Pages/inventory/transferOrders/newTransferOrder"));
const TransferOrderOverview        = lazy(() => import("../feature-module/Pages/inventory/transferOrders/transferOrderOverview"));
const NewItem = lazy(() => import("../feature-module/Pages/inventory/items/newItem"));
const ItemsList = lazy(() => import("../feature-module/Pages/inventory/items/itemsList"));
const ItemOverview = lazy(() => import("../feature-module/Pages/inventory/items/itemOverview"));
const AddOpeningStock = lazy(() => import("../feature-module/Pages/inventory/items/addOpeningStock"));
const CompositeItem = lazy(() => import("../feature-module/Pages/inventory/items/compositeItem"));
const CompositeItemsList = lazy(() => import("../feature-module/Pages/inventory/items/compositeItemsList"));
const CompositeItemOverview = lazy(() => import("../feature-module/Pages/inventory/items/compositeItemOverview"));
const LocationList = lazy(() => import("../feature-module/Pages/inventory/locations/locationList"));
const LocationOverview = lazy(() => import("../feature-module/Pages/inventory/locations/locationOverview"));
const AddLocation = lazy(() => import("../feature-module/Pages/inventory/locations/location"));
const TransactionSeriesList = lazy(() => import("../feature-module/Pages/inventory/locations/transactionSeriesList"));
const TransactionSeriesOverview = lazy(() => import("../feature-module/Pages/inventory/locations/transactionSeriesOverview"));
const NewTransactionSeries = lazy(() => import("../feature-module/Pages/inventory/locations/newTransactionSeries"));
const PriceList = lazy(() => import("../feature-module/Pages/inventory/price-list/priceList"));
const NewPriceList = lazy(() => import("../feature-module/Pages/inventory/price-list/newPriceList"));
const PriceListOverview = lazy(() => import("../feature-module/Pages/inventory/price-list/priceListOverview"));
const DistributionCategoryList = lazy(() => import("../feature-module/Pages/customers/customerCategories/distributionCategoryList"));
const NewDistributionCategory = lazy(() => import("../feature-module/Pages/customers/customerCategories/newDistributionCategory"));
const DistributionSubCategoryList = lazy(() => import("../feature-module/Pages/customers/customerSubCategories/distributionSubCategoryList"));
const NewDistributionSubCategory = lazy(() => import("../feature-module/Pages/customers/customerSubCategories/newDistributionSubCategory"));
const DistributionLocationList = lazy(() => import("../feature-module/Pages/customers/distributionLocation/distributionLocationList"));
const AddNewParty = lazy(() => import("../feature-module/Pages/customers/distributors/addNewParty"));
const DistributorsList = lazy(() => import("../feature-module/Pages/customers/distributors/distributorsList"));
const PartyOverview = lazy(() => import("../feature-module/Pages/customers/distributors/partyOverview"));
const EditCustomField = lazy(() => import("../feature-module/Pages/settings/app-settings/editCustomField"));
const EmailSettings = lazy(() => import("../feature-module/Pages/settings/system-settings/emailSettings"));
const SmsGateways = lazy(() => import("../feature-module/Pages/settings/system-settings/smsGateways"));
const GdprCookies = lazy(() => import("../feature-module/Pages/settings/system-settings/gdprCookies"));
const PaymentGateways = lazy(() => import("../feature-module/Pages/settings/financial-settings/paymentGateways"));
const BankAccounts = lazy(() => import("../feature-module/Pages/settings/financial-settings/bankAccounts"));
const TaxRates = lazy(() => import("../feature-module/Pages/settings/financial-settings/taxRates"));
const Currencies = lazy(() => import("../feature-module/Pages/settings/financial-settings/currencies"));
const Sitemap = lazy(() => import("../feature-module/Pages/settings/other-settings/sitemap"));
const ClearCache = lazy(() => import("../feature-module/Pages/settings/other-settings/clearCache"));
const Storage = lazy(() => import("../feature-module/Pages/settings/other-settings/storage"));
const Cronjob = lazy(() => import("../feature-module/Pages/settings/other-settings/cronjob"));
const BanIpAddress = lazy(() => import("../feature-module/Pages/settings/other-settings/banIpAddress"));
const SystemBackup = lazy(() => import("../feature-module/Pages/settings/other-settings/systemBackup"));
const DatabaseBackup = lazy(() => import("../feature-module/Pages/settings/other-settings/databaseBackup"));
const SystemUpdate = lazy(() => import("../feature-module/Pages/settings/other-settings/systemUpdate"));
const Notifications = lazy(() => import("../feature-module/Pages/notifications/notifications"));
const Dashboard = lazy(() => import("../feature-module/Pages/super-admin/dashboard"));
const Company = lazy(() => import("../feature-module/Pages/super-admin/company"));
const Subscription = lazy(() => import("../feature-module/Pages/super-admin/subscription"));
const Packages = lazy(() => import("../feature-module/Pages/super-admin/packages"));
const Domain = lazy(() => import("../feature-module/Pages/super-admin/domain"));
const PurchaseTransaction = lazy(() => import("../feature-module/Pages/super-admin/purchaseTransaction"));
const MapsLeaflet = lazy(() => import("../feature-module/Pages/ui-module/map/leaflet"));
const FormSelect2 = lazy(() => import("../feature-module/Pages/ui-module/forms/form-select2/formSelect2"));
const UiSweetAlerts = lazy(() => import("../feature-module/Pages/ui-module/ui-advance/uiSweetAlerts"));

const route = all_routes;

export const publicRoutes = [
  {
    path: "/",
    name: "Root",
    element: <Navigate to={route.login} />,
    route: Route,
  },
  {
    id: "1",
    path: route.dealsDashboard,
    element: <DelasDashboard />,
    route: Route,
    meta_title: "Dashboard",
  },
  {
    id: "2",
    path: route.contactGrid,
    element: <Contacts />,
    route: Route,
    meta_title: "Dashboard",
  },
  {
    id: "3",
    path: route.uiAccordion,
    element: <UiAccordion />,
    route: Route,
    meta_title: "Accordions",
  },
  {
    id: "4",
    path: route.uiAccordion,
    element: <UiAccordion />,
    route: Route,
    meta_title: "Accordions",
  },
  {
    id: "5",
    path: route.uiAlerts,
    element: <UiAlerts />,
    route: Route,
    meta_title: "Alerts",
  },
  {
    id: "6",
    path: route.uiAvatar,
    element: <UiAvatar />,
    route: Route,
    meta_title: "Avatars",
  },

  {
    id: "7",
    path: route.uiBadges,
    element: <UiBadges />,
    route: Route,
    meta_title: "Badges",
  },
  {
    id: "8",
    path: route.uiBreadcrumb,
    element: <UiBreadcrumb />,
    route: Route,
    meta_title: "Breadcrumb",
  },
  {
    id: "9",
    path: route.uiButtons,
    element: <UiButtons />,
    route: Route,
    meta_title: "Buttons",
  },
  {
    id: "10",
    path: route.uiButtonsGroup,
    element: <UiButtonsGroup />,
    route: Route,
    meta_title: "Button Group",
  },
  {
    id: "11",
    path: route.uiCards,
    element: <UiCards />,
    route: Route,
    meta_title: "Cards",
  },

  {
    id: "12",
    path: route.uiCarousel,
    element: <UiCarousel />,
    route: Route,
    meta_title: "Carousel",
  },
  {
    id: "13",
    path: route.uiCollapse,
    element: <UiCollapse />,
    route: Route,
    meta_title: "Collapse",
  },
  {
    id: "14",
    path: route.uiDropdowns,
    element: <UiDropdowns />,
    route: Route,
    meta_title: "Dropdowns",
  },
  {
    id: "15",
    path: route.uiGrid,
    element: <UiGrid />,
    route: Route,
    meta_title: "Grid System",
  },
  {
    id: "16",
    path: route.uiRatio,
    element: <UiRatio />,
    route: Route,
    meta_title: "Ratio Video",
  },
  {
    id: "17",
    path: route.uiImage,
    element: <UiImages />,
    route: Route,
    meta_title: "Images",
  },
  {
    id: "18",
    path: route.uiLinks,
    element: <UiLinks />,
    route: Route,
    meta_title: "Links",
  },
  {
    id: "19",
    path: route.uiListGroup,
    element: <UiListGroup />,
    route: Route,
    meta_title: "List Group",
  },
  {
    id: "20",
    path: route.uiModals,
    element: <UiModals />,
    route: Route,
    meta_title: "Modals",
  },
  {
    id: "21",
    path: route.offcanvas,
    element: <UiOffcanvas />,
    route: Route,
    meta_title: "Offcanvas",
  },
  {
    id: "22",
    path: route.pagination,
    element: <UiPagination />,
    route: Route,
    meta_title: "Pagination",
  },
  {
    id: "23",
    path: route.placeholder,
    element: <UiPlaceholders />,
    route: Route,
    meta_title: "Placeholders",
  },
  {
    id: "24",
    path: route.popover,
    element: <UiPopovers />,
    route: Route,
    meta_title: "Popovers",
  },

  {
    id: "25",
    path: route.progress,
    element: <UiProgress />,
    route: Route,
    meta_title: "Progress",
  },
  {
    id: "26",
    path: route.spinner,
    element: <UiSpinner />,
    route: Route,
    meta_title: "Spinners",
  },
  {
    id: "27",
    path: route.navTabs,
    element: <UiNavTabs />,
    route: Route,
    meta_title: "Tabs",
  },
  {
    id: "28",
    path: route.toasts,
    element: <UiToasts />,
    route: Route,
    meta_title: "Toast",
  },
  {
    id: "29",
    path: route.tooltip,
    element: <UiTooltips />,
    route: Route,
    meta_title: "Tooltips",
  },
  {
    id: "30",
    path: route.typography,
    element: <UiTypography />,
    route: Route,
    meta_title: "Typography",
  },
  {
    id: "31",
    path: route.uiUtilities,
    element: <UiUtilities />,
    route: Route,
    meta_title: "Utilities",
  },
  {
    id: "32",
    path: route.dragandDrop,
    element: <UiDragula />,
    route: Route,
    meta_title: "Dragula",
  },
  {
    id: "33",
    path: route.clipboard,
    element: <UiClipBoard />,
    route: Route,
    meta_title: "Clipboard",
  },
  {
    id: "34",
    path: route.rangeSlider,
    element: <UiRangeSlides />,
    route: Route,
    meta_title: "Range Slider",
  },
  {
    id: "35",
    path: route.lightbox,
    element: <UiLightboxes />,
    route: Route,
    meta_title: "Lightbox",
  },
  {
    id: "36",
    path: route.rating,
    element: <UiRating />,
    route: Route,
    meta_title: "Rating",
  },
  {
    id: "37",
    path: route.scrollBar,
    element: <UiScrollbar />,
    route: Route,
    meta_title: "Scrollbar",
  },
  {
    id: "38",
    path: route.uiScrollspy,
    element: <UiScrollspy />,
    route: Route,
    meta_title: "Scrollbar",
  },
  {
    id: "39",
    path: route.basicInput,
    element: <FormBasicInputs />,
    route: Route,
    meta_title: "Form Elements",
  },
  {
    id: "40",
    path: route.checkboxandRadios,
    element: <FormCheckboxRadios />,
    route: Route,
    meta_title: "Checkbox & Radios",
  },
  {
    id: "41",
    path: route.inputGroup,
    element: <FormInputGroups />,
    route: Route,
    meta_title: "input Groups",
  },
  {
    id: "42",
    path: route.gridandGutters,
    element: <FormGridGutters />,
    route: Route,
    meta_title: "Grid System",
  },
  {
    id: "43",
    path: route.formMask,
    element: <FormMask />,
    route: Route,
    meta_title: "Form Inputmask",
  },
  {
    id: "44",
    path: route.fileUpload,
    element: <FormFileupload />,
    route: Route,
    meta_title: "File Uploads",
  },
  {
    id: "45",
    path: route.horizontalForm,
    element: <FormHorizontal />,
    route: Route,
    meta_title: "Form Horizontal",
  },
  {
    id: "46",
    path: route.verticalForm,
    element: <FormVertical />,
    route: Route,
    meta_title: "Form Vertical",
  },
  {
    id: "47",
    path: route.floatingLable,
    element: <FormFloatingLabels />,
    route: Route,
    meta_title: "Floating Label",
  },
  {
    id: "48",
    path: route.formValidation,
    element: <FormValidation />,
    route: Route,
    meta_title: "Form Validation",
  },
  {
    id: "49",
    path: route.formWizard,
    element: <FormWizard />,
    route: Route,
    meta_title: "Form Wizard",
  },
  {
    id: "50",
    path: route.formpicker,
    element: <FormPickers />,
    route: Route,
    meta_title: "Form Picker",
  },
  {
    id: "51",
    path: route.tablesBasic,
    element: <TablesBasic />,
    route: Route,
    meta_title: "Table Basic",
  },
  {
    id: "52",
    path: route.dataTables,
    element: <DataTables />,
    route: Route,
    meta_title: "Data Tables",
  },
  {
    id: "53",
    path: route.apexChat,
    element: <ChartApex />,
    route: Route,
    meta_title: "Apex Charts",
  },
  {
    id: "54",
    path: route.bootstrapicons,
    element: <IconBootstrap />,
    route: Route,
    meta_title: "Bootstrap Icons",
  },

  {
    id: "55",
    path: route.falgIcons,
    element: <IconFlag />,
    route: Route,
    meta_title: "Flag Icons",
  },
  {
    id: "56",
    path: route.fantawesome,
    element: <IconFontawesome />,
    route: Route,
    meta_title: "Fontawesome Icon",
  },
  {
    id: "57",
    path: route.iconicIcon,
    element: <IconIonic />,
    route: Route,
    meta_title: "Ionic Icon",
  },
  {
    id: "58",
    path: route.materialIcon,
    element: <IconMaterial />,
    route: Route,
    meta_title: "Material Icons",
  },
  {
    id: "59",
    path: route.pe7icon,
    element: <IconPe7 />,
    route: Route,
    meta_title: "Pe7 Icon",
  },
  {
    id: "60",
    path: route.remixicons,
    element: <IconRemix />,
    route: Route,
    meta_title: "Remix Icons",
  },
  {
    id: "61",
    path: route.tablericons,
    element: <IconTabler />,
    route: Route,
    meta_title: "Tabler Icons",
  },
  {
    id: "62",
    path: route.themifyIcon,
    element: <IconThemify />,
    route: Route,
    meta_title: "Themify Icon",
  },

  {
    id: "63",
    path: route.typicon,
    element: <IconTypicon />,
    route: Route,
    meta_title: "Typicon Icon",
  },
  {
    id: "64",
    path: route.weatherIcon,
    element: <IconWeather />,
    route: Route,
    meta_title: "Weather Icon",
  },
  {
    id: "65",
    path: route.contactList,
    element: <ContactsList />,
    route: Route,
    meta_title: "Contacts",
  },
  {
    id: "66",
    path: route.chat,
    element: <Chat />,
    route: Route,
    meta_title: "Chat",
  },
  {
    id: "67",
    path: route.videoCall,
    element: <VideoCall />,
    route: Route,
    meta_title: "Video Call",
  },
  {
    id: "68",
    path: route.audioCall,
    element: <AudioCall />,
    route: Route,
    meta_title: "Audio Call",
  },
  {
    id: "69",
    path: route.callHistory,
    element: <CallHistory />,
    route: Route,
    meta_title: "Call History",
  },
  {
    id: "70",
    path: route.calendar,
    element: <Calender />,
    route: Route,
    meta_title: "Calendar",
  },
  {
    id: "71",
    path: route.email,
    element: <Email />,
    route: Route,
    meta_title: "Email",
  },
  {
    id: "72",
    path: route.emailReply,
    element: <EmailReply />,
    route: Route,
    meta_title: "Email",
  },
  {
    id: "73",
    path: route.todo,
    element: <Todo />,
    route: Route,
    meta_title: "Todo",
  },
  {
    id: "74",
    path: route.todoList,
    element: <TodoList />,
    route: Route,
    meta_title: "Todo List",
  },
  {
    id: "75",
    path: route.notes,
    element: <Notes />,
    route: Route,
    meta_title: "Notes",
  },
  {
    id: "76",
    path: route.fileManager,
    element: <FileManager />,
    route: Route,
    meta_title: "File Manager",
  },
  {
    id: "77",
    path: route.socialfeed,
    element: <SocialFeed />,
    route: Route,
    meta_title: "Social Feed",
  },
  {
    id: "78",
    path: route.kanbanview,
    element: <KanbanView />,
    route: Route,
    meta_title: "Kanban View",
  },
  {
    id: "79",
    path: route.invoice,
    element: <Invoice />,
    route: Route,
    meta_title: "Invoice",
  },
  {
    id: "80",
    path: route.addInvoices,
    element: <AddInoivce />,
    route: Route,
    meta_title: "Invoice",
  },
  {
    id: "81",
    path: route.editInvoices,
    element: <EditInoivce />,
    route: Route,
    meta_title: "Invoice",
  },
  {
    id: "82",
    path: route.invoice_details,
    element: <InvoiceDetails />,
    route: Route,
    meta_title: "Invoice Details",
  },
  {
    id: "83",
    path: route.blankPage,
    element: <BlankPage />,
    route: Route,
    meta_title: "Blank Page",
  },
  {
    id: "84",
    path: route.leadsDashboard,
    element: <LeadsDashboard />,
    route: Route,
    meta_title: "Leads Dashboard",
  },
  {
    id: "84",
    path: route.projectDashboard,
    element: <ProjectDashboard />,
    route: Route,
    meta_title: "Project Dashboard",
  },
  {
    id: "85",
    path: route.contactDetails,
    element: <ContactsDetails />,
    route: Route,
    meta_title: "Contact Details",
  },
  {
    id: "86",
    path: route.companiesGrid,
    element: <CompaniesGrid />,
    route: Route,
    meta_title: "Companies Grid",
  },
  {
    id: "87",
    path: route.companiesList,
    element: <CompaniesList />,
    route: Route,
    meta_title: "Companies List",
  },
  {
    id: "88",
    path: route.companiesDetails,
    element: <CompaniesDetails />,
    route: Route,
    meta_title: "Companies Details",
  },
  {
    id: "89",
    path: route.dealsGrid,
    element: <DealsGrid />,
    route: Route,
    meta_title: "Deals",
  },
  {
    id: "90",
    path: route.dealsList,
    element: <DealsList />,
    route: Route,
    meta_title: "Deals",
  },
  {
    id: "91",
    path: route.dealsDetails,
    element: <DealsDetails />,
    route: Route,
    meta_title: "Deals Details",
  },
  {
    id: "92",
    path: route.leads,
    element: <Leads />,
    route: Route,
    meta_title: "Leads",
  },
  {
    id: "93",
    path: route.leadsList,
    element: <LeadsList />,
    route: Route,
    meta_title: "Leads List",
  },
  {
    id: "94",
    path: route.leadsDetails,
    element: <LeadsDetails />,
    route: Route,
    meta_title: "Leads Details",
  },
  {
    id: "95",
    path: route.pipeline,
    element: <Pipeline />,
    route: Route,
    meta_title: "Pipeline",
  },
  {
    id: "96",
    path: route.campaign,
    element: <Campaign />,
    route: Route,
    meta_title: "Campaign",
  },
  {
    id: "97",
    path: route.campaignComplete,
    element: <CampaignComplete />,
    route: Route,
    meta_title: "Campaign",
  },
  {
    id: "98",
    path: route.campaignArchieve,
    element: <CampaignArchieve />,
    route: Route,
    meta_title: "Campaign",
  },
  {
    id: "99",
    path: route.projectsGrid,
    element: <ProjectsGrid />,
    route: Route,
    meta_title: "Projects",
  },
  {
    id: "100",
    path: route.projectsList,
    element: <ProjectsList />,
    route: Route,
    meta_title: "Projects",
  },
  {
    id: "101",
    path: route.projectDetails,
    element: <ProjectDetails />,
    route: Route,
    meta_title: "Projects",
  },
  {
    id: "102",
    path: route.tasks,
    element: <Tasks />,
    route: Route,
    meta_title: "Tasks",
  },
  {
    id: "103",
    path: route.tasksImportant,
    element: <TasksImportant />,
    route: Route,
    meta_title: "Tasks",
  },
  {
    id: "104",
    path: route.tasksCompleted,
    element: <Taskscompleted />,
    route: Route,
    meta_title: "Tasks",
  },
  {
    id: "105",
    path: route.ProposalsGrid,
    element: <Proposals />,
    route: Route,
    meta_title: "Proposals",
  },
  {
    id: "106",
    path: route.ProposalsList,
    element: <ProposalList />,
    route: Route,
    meta_title: "Proposals List",
  },
  {
    id: "107",
    path: route.ContractsGrid,
    element: <Contracts />,
    route: Route,
    meta_title: "Contracts",
  },
  {
    id: "108",
    path: route.ContractsList,
    element: <ContractsList />,
    route: Route,
    meta_title: "Contracts List",
  },
  {
    id: "109",
    path: route.estimationKanban,
    element: <Estimations />,
    route: Route,
    meta_title: "Estimations",
  },
  {
    id: "110",
    path: route.estimationList,
    element: <EstimationsList />,
    route: Route,
    meta_title: "Estimations List",
  },
  {
    id: "111",
    path: route.InvoiceGrid,
    element: <InvoicesGrid />,
    route: Route,
    meta_title: "Invoice Grid",
  },
  {
    id: "112",
    path: route.InvoiceList,
    element: <InvoicesList />,
    route: Route,
    meta_title: "Invoice List",
  },
  {
    id: "112a-base",
    path: route.invoices,
    element: <InvoicesList />,
    route: Route,
    meta_title: "Invoices",
    permModule: "invoices",
  },
  {
    id: "112b",
    path: route.newInvoice,
    element: <NewInvoice />,
    route: Route,
    meta_title: "New Invoice",
    permModule: "invoices",
    permAction: "create",
  },
  {
    id: "112b-edit",
    path: route.editInvoice,
    element: <NewInvoice />,
    route: Route,
    meta_title: "Edit Invoice",
    permModule: "invoices",
    permAction: "edit",
  },
  {
    id: "112c",
    path: route.invoiceOverview,
    element: <InvoiceOverview />,
    route: Route,
    meta_title: "Invoice Overview",
    permModule: "invoices",
  },
  {
    id: "112d",
    path: route.recordPayment,
    element: <RecordPayment />,
    route: Route,
    meta_title: "Record Payment",
    permModule: "payments",
    permAction: "create",
  },
  {
    id: "112e",
    path: route.newCreditNote,
    element: <NewCreditNote />,
    route: Route,
    meta_title: "New Credit Note",
    permModule: "credit_notes",
    permAction: "create",
  },
  {
    id: "112f",
    path: route.creditNotes,
    element: <CreditNotesList />,
    route: Route,
    meta_title: "Credit Notes",
    permModule: "credit_notes",
  },
  {
    id: "112g",
    path: route.creditNoteOverview,
    element: <CreditNoteOverview />,
    route: Route,
    meta_title: "Credit Note Overview",
    permModule: "credit_notes",
  },
  {
    id: "113",
    path: route.payments,
    element: <Payments />,
    route: Route,
    meta_title: "Payments",
    permModule: "payments",
  },
  {
    id: "113a",
    path: route.newPayment,
    element: <NewPayment />,
    route: Route,
    meta_title: "New Payment",
    permModule: "payments",
    permAction: "create",
  },
  {
    id: "113b",
    path: route.paymentRefund,
    element: <PaymentRefund />,
    route: Route,
    meta_title: "Refund Payment",
  },
  {
    id: "113b2",
    path: route.paymentRefundEdit,
    element: <PaymentRefund />,
    route: Route,
    meta_title: "Edit Refund",
  },
  {
    id: "113c",
    path: route.paymentOverview,
    element: <PaymentOverview />,
    route: Route,
    meta_title: "Payment Overview",
  },
  {
    id: "114",
    path: route.analytics,
    element: <Analytics />,
    route: Route,
    meta_title: "Analytics",
  },
  {
    id: "115",
    path: route.activities,
    element: <Activities />,
    route: Route,
    meta_title: "Activities",
  },
  {
    id: "116",
    path: route.leadReports,
    element: <LeadReports />,
    route: Route,
    meta_title: "Lead Report",
  },
  {
    id: "117",
    path: route.dealReports,
    element: <DealReports />,
    route: Route,
    meta_title: "Deal Report",
  },
  {
    id: "118",
    path: route.contactReports,
    element: <ContactReports />,
    route: Route,
    meta_title: "Contact Report",
  },
  {
    id: "119",
    path: route.companyReports,
    element: <CompanyReports />,
    route: Route,
    meta_title: "Company Report",
  },
  {
    id: "120",
    path: route.projectReports,
    element: <ProjectReports />,
    route: Route,
    meta_title: "Project Report",
  },
  {
    id: "121",
    path: route.taskReports,
    element: <TaskReports />,
    route: Route,
    meta_title: "Task  Report",
  },
  {
    id: "122",
    path: route.sources,
    element: <Sources />,
    route: Route,
    meta_title: "Sources",
  },
  {
    id: "123",
    path: route.lostReason,
    element: <LostReason />,
    route: Route,
    meta_title: "Lost Reason",
  },
  {
    id: "124",
    path: route.activityCalls,
    element: <ActivityCalls />,
    route: Route,
    meta_title: "Activities",
  },
  {
    id: "125",
    path: route.activityMail,
    element: <ActivityMails />,
    route: Route,
    meta_title: "Activities",
  },
  {
    id: "126",
    path: route.activityTask,
    element: <ActivityTasks />,
    route: Route,
    meta_title: "Activities",
  },
  {
    id: "127",
    path: route.activityMeeting,
    element: <ActivityMeetings />,
    route: Route,
    meta_title: "Activities",
  },
  {
    id: "128",
    path: route.contactStage,
    element: <ContactStage />,
    route: Route,
    meta_title: "Contact Stages",
  },
  {
    id: "129",
    path: route.industry,
    element: <Industry />,
    route: Route,
    meta_title: "Industry",
  },
  {
    id: "130",
    path: route.calls,
    element: <Calls />,
    route: Route,
    meta_title: "Calls Reason",
  },
  {
    id: "131",
    path: route.manageusers,
    element: <ManageUsers />,
    route: Route,
    meta_title: "Manage Users",
    permModule: "users",
  },
  {
    id: "131a",
    path: route.newUser,
    element: <NewUser />,
    route: Route,
    meta_title: "New User",
    permModule: "users",
    permAction: "create",
  },
  {
    id: "131a2",
    path: route.editUser,
    element: <EditUser />,
    route: Route,
    meta_title: "Edit User",
    permModule: "users",
    permAction: "edit",
  },
  {
    id: "131b",
    path: route.userOverview,
    element: <UserOverview />,
    route: Route,
    meta_title: "User Overview",
    permModule: "users",
  },
  {
    id: "132",
    path: route.rolesPermissions,
    element: <RolesPermissions />,
    route: Route,
    meta_title: "Roles & Permissions",
    permModule: "roles",
  },
  {
    id: "132a",
    path: route.newRole,
    element: <NewRole />,
    route: Route,
    meta_title: "New Role",
    permModule: "roles",
    permAction: "create",
  },
  {
    id: "132b",
    path: route.roleOverview,
    element: <RoleOverview />,
    route: Route,
    meta_title: "Role Overview",
    permModule: "roles",
  },
  {
    id: "132c",
    path: route.editRole,
    element: <EditRole />,
    route: Route,
    meta_title: "Edit Role",
    permModule: "roles",
    permAction: "edit",
  },
  {
    id: "133",
    path: route.permissions,
    element: <Permission />,
    route: Route,
    meta_title: "Permission",
  },
  {
    id: "134",
    path: route.deleteRequest,
    element: <DeleteRequest />,
    route: Route,
    meta_title: "Delete Account Request",
  },
  {
    id: "135",
    path: route.membershipplan,
    element: <MembershipPlans />,
    route: Route,
    meta_title: "Membership Plans",
  },
  {
    id: "136",
    path: route.membershipAddon,
    element: <MembershipAddons />,
    route: Route,
    meta_title: "Membership Addons",
  },
  {
    id: "137",
    path: route.membershipTransaction,
    element: <MembershipTransactions />,
    route: Route,
    meta_title: "Membership Transactions",
  },
  {
    id: "138",
    path: route.pages,
    element: <Page />,
    route: Route,
    meta_title: "Pages",
  },
  {
    id: "139",
    path: route.addpages,
    element: <AddPage />,
    route: Route,
    meta_title: "Add Pages",
  },
  {
    id: "140",
    path: route.editpages,
    element: <EditPage />,
    route: Route,
    meta_title: "Edit Pages",
  },
  {
    id: "141",
    path: route.blog,
    element: <Blogs />,
    route: Route,
    meta_title: "Blogs",
  },
  {
    id: "142",
    path: route.addblog,
    element: <Addblog />,
    route: Route,
    meta_title: "Add Blogs",
  },
  {
    id: "143",
    path: route.editblog,
    element: <Editblog />,
    route: Route,
    meta_title: "Edit Blogs",
  },
  {
    id: "144",
    path: route.blogDetails,
    element: <BlogDetails />,
    route: Route,
    meta_title: "Blogs Details",
  },
  {
    id: "145",
    path: route.blogCategories,
    element: <BlogCategories />,
    route: Route,
    meta_title: "Blog Categories",
  },
  {
    id: "146",
    path: route.blogComment,
    element: <BlogComments />,
    route: Route,
    meta_title: "Blog Comments",
  },
  {
    id: "147",
    path: route.blogTags,
    element: <BlogTags />,
    route: Route,
    meta_title: "Blog Tags",
  },
  {
    id: "148",
    path: route.countries,
    element: <Countries />,
    route: Route,
    meta_title: "Countries",
  },
  {
    id: "149",
    path: route.states,
    element: <States />,
    route: Route,
    meta_title: "States",
  },
  {
    id: "150",
    path: route.cities,
    element: <Cities />,
    route: Route,
    meta_title: "City",
  },
  {
    id: "151",
    path: route.testimonials,
    element: <Testimonials />,
    route: Route,
    meta_title: "Testimonials",
  },
  {
    id: "152",
    path: route.faq,
    element: <Faq />,
    route: Route,
    meta_title: "FAQ",
  },
  {
    id: "153",
    path: route.contactMessages,
    element: <ContactMessages />,
    route: Route,
    meta_title: "Contact Messages",
  },
  {
    id: "154",
    path: route.tickets,
    element: <Tickets />,
    route: Route,
    meta_title: "Tickets",
  },
  {
    id: "155",
    path: route.ticketsDetails,
    element: <TicketDetails />,
    route: Route,
    meta_title: "Tickets Details",
  },
  {
    id: "156",
    path: route.profile,
    element: <ProfileSettings />,
    route: Route,
    meta_title: "Settings - Profile Settings",
  },
  {
    id: "157",
    path: route.security,
    element: <SecuritySettings />,
    route: Route,
    meta_title: "Settings - Security Settings",
    permModule: "settings",
  },
  {
    id: "158",
    path: route.notification,
    element: <NotificationsSettings />,
    route: Route,
    meta_title: "Settings - Notification Settings",
    permModule: "settings",
  },
  {
    id: "159",
    path: route.connectedApps,
    element: <ConnectedApps />,
    route: Route,
    meta_title: "Settings - Connected Apps",
    permModule: "settings",
  },
  {
    id: "160",
    path: route.companySettings,
    element: <CompanySettings />,
    route: Route,
    meta_title: "Settings - Company",
    permModule: "settings",
  },
  {
    id: "161",
    path: route.localization,
    element: <LocalizationSettings />,
    route: Route,
    meta_title: "Settings - Localization",
    permModule: "settings",
  },
  {
    id: "162",
    path: route.prefixes,
    element: <PrefixesSettings />,
    route: Route,
    meta_title: "Settings - Prefixes",
    permModule: "settings",
  },
  {
    id: "163",
    path: route.preference,
    element: <PreferenceSettings />,
    route: Route,
    meta_title: "Settings - Preference",
    permModule: "settings",
  },
  {
    id: "164",
    path: route.appearance,
    element: <AppearanceSettings />,
    route: Route,
    meta_title: "Settings - Appearance",
    permModule: "settings",
  },
  {
    id: "165",
    path: route.languageWeb,
    element: <LanguageSettings />,
    route: Route,
    meta_title: "Settings - Language",
    permModule: "settings",
  },
  {
    id: "166",
    path: route.invoiceSettings,
    element: <InvoiceSettings />,
    route: Route,
    meta_title: "Settings - Invoice",
    permModule: "settings",
  },
  {
    id: "167",
    path: route.printers,
    element: <PrintersSettings />,
    route: Route,
    meta_title: "Settings - Printers",
    permModule: "settings",
  },
  {
    id: "168",
    path: route.customFields,
    element: <CustomFieldsSetting />,
    route: Route,
    meta_title: "Settings - Custom Fields",
    permModule: "settings",
  },
  {
    id: "settings-home",
    path: route.settingsHome,
    element: <SettingsHome />,
    route: Route,
    meta_title: "Settings",
    permModule: "settings",
  },
  {
    id: "168a",
    path: route.projectSettings,
    element: <ProjectSettings />,
    route: Route,
    meta_title: "Settings - Product Settings",
    permModule: "settings",
  },
  {
    id: "168b",
    path: route.customerSettings,
    element: <CustomerSettings />,
    route: Route,
    meta_title: "Settings - Customer Settings",
    permModule: "settings",
  },
  {
    id: "168c",
    path: route.paymentReceivedSettings,
    element: <PaymentReceivedSettings />,
    route: Route,
    meta_title: "Settings - Payments Received Settings",
    permModule: "settings",
  },
  {
    id: "inventory-0",
    path: route.inventoryList,
    element: <InventoryList />,
    route: Route,
    meta_title: "Inventory",
    permModule: "inventory",
  },
  {
    id: "assemblies-list",
    path: route.assemblies,
    element: <AssembliesList />,
    route: Route,
    meta_title: "Assemblies",
    permModule: "assemblies",
  },
  {
    id: "assembly-overview",
    path: route.assemblyOverview,
    element: <AssemblyOverview />,
    route: Route,
    meta_title: "Assembly Overview",
    permModule: "assemblies",
  },
  {
    id: "assembly-0",
    path: route.newAssembly,
    element: <NewAssembly />,
    route: Route,
    meta_title: "New Assembly",
    permModule: "assemblies",
    permAction: "create",
  },
  {
    id: "adj-list",
    path: route.inventoryAdjustments,
    element: <InventoryAdjustmentsList />,
    route: Route,
    meta_title: "Inventory Adjustments",
    permModule: "inventory_adjustments",
  },
  {
    id: "adj-new",
    path: route.newInventoryAdjustment,
    element: <NewInventoryAdjustment />,
    route: Route,
    meta_title: "New Inventory Adjustment",
    permModule: "inventory_adjustments",
    permAction: "create",
  },
  {
    id: "adj-overview",
    path: route.inventoryAdjustmentOverview,
    element: <InventoryAdjustmentOverview />,
    route: Route,
    meta_title: "Adjustment Overview",
    permModule: "inventory_adjustments",
  },
  {
    id: "transfer-list",
    path: route.transferOrders,
    element: <TransferOrdersList />,
    route: Route,
    meta_title: "Transfer Orders",
    permModule: "transfer_orders",
  },
  {
    id: "transfer-new",
    path: route.newTransferOrder,
    element: <NewTransferOrder />,
    route: Route,
    meta_title: "New Transfer Order",
    permModule: "transfer_orders",
    permAction: "create",
  },
  {
    id: "transfer-overview",
    path: route.transferOrderOverview,
    element: <TransferOrderOverview />,
    route: Route,
    meta_title: "Transfer Order",
    permModule: "transfer_orders",
  },
  {
    id: "inv-0",
    path: route.itemsList,
    element: <ItemsList />,
    route: Route,
    meta_title: "Items",
    permModule: "items",
  },
  {
    id: "inv-1",
    path: route.addItem,
    element: <NewItem />,
    route: Route,
    meta_title: "New Item",
    permModule: "items",
    permAction: "create",
  },
  {
    id: "inv-2",
    path: route.itemOverview,
    element: <ItemOverview />,
    route: Route,
    meta_title: "Item Overview",
    permModule: "items",
  },
  {
    id: "inv-3",
    path: route.editItem,
    element: <NewItem />,
    route: Route,
    meta_title: "Edit Item",
    permModule: "items",
    permAction: "edit",
  },
  {
    id: "inv-4",
    path: route.addOpeningStock,
    element: <AddOpeningStock />,
    route: Route,
    meta_title: "Add Opening Stock",
    permModule: "items",
    permAction: "edit",
    permAllowParty: true,
  },
  {
    id: "comp-0",
    path: route.compositeItems,
    element: <CompositeItemsList />,
    route: Route,
    meta_title: "Composite Items",
    feature: "composite_items",
    permModule: "composite_items",
  },
  {
    id: "comp-1",
    path: route.addCompositeItem,
    element: <CompositeItem />,
    route: Route,
    meta_title: "New Composite Item",
    feature: "composite_items",
    permModule: "composite_items",
    permAction: "create",
  },
  {
    id: "comp-2",
    path: route.compositeItemOverview,
    element: <CompositeItemOverview />,
    route: Route,
    meta_title: "Composite Item Overview",
    feature: "composite_items",
    permModule: "composite_items",
  },
  {
    id: "comp-3",
    path: route.editCompositeItem,
    element: <CompositeItem />,
    route: Route,
    meta_title: "Edit Composite Item",
    feature: "composite_items",
    permModule: "composite_items",
    permAction: "edit",
  },
  {
    id: "inv-loc-list",
    path: route.locations,
    element: <LocationList />,
    route: Route,
    meta_title: "Locations",
  },
  {
    id: "inv-loc-overview",
    path: route.locationOverview,
    element: <LocationOverview />,
    route: Route,
    meta_title: "Location Overview",
  },
  {
    id: "inv-3",
    path: route.addLocation,
    element: <AddLocation />,
    route: Route,
    meta_title: "Add Location",
  },
  {
    id: "inv-loc-edit",
    path: route.editLocation,
    element: <AddLocation />,
    route: Route,
    meta_title: "Edit Location",
  },
  {
    id: "inv-txn-series-list",
    path: route.transactionSeriesList,
    element: <TransactionSeriesList />,
    route: Route,
    meta_title: "Transaction Number Series",
  },
  {
    id: "inv-txn-series-overview",
    path: route.transactionSeriesOverview,
    element: <TransactionSeriesOverview />,
    route: Route,
    meta_title: "Transaction Series Overview",
  },
  {
    id: "inv-txn-series-new",
    path: route.newTransactionSeries,
    element: <NewTransactionSeries />,
    route: Route,
    meta_title: "New Transaction Series",
  },
  {
    id: "inv-txn-series-edit",
    path: route.editTransactionSeries,   // /locations/series/:seriesId/edit
    element: <NewTransactionSeries />,
    route: Route,
    meta_title: "Edit Transaction Series",
  },
  {
    id: "inv-price-list",
    path: route.priceList,
    element: <PriceList />,
    route: Route,
    meta_title: "Price Lists",
    feature: "price_lists",
    permModule: "price_list",
    permAllowParty: true,
  },
  {
    id: "inv-price-list-overview",
    path: route.priceListOverview,
    element: <PriceListOverview />,
    route: Route,
    meta_title: "Price List Overview",
    feature: "price_lists",
    permModule: "price_list",
  },
  {
    id: "inv-price-list-new",
    path: route.newPriceList,
    element: <NewPriceList />,
    route: Route,
    meta_title: "New Price List",
    feature: "price_lists",
    permModule: "price_list",
    permAction: "create",
  },
  {
    id: "inv-price-list-edit",
    path: route.editPriceList,
    element: <NewPriceList />,
    route: Route,
    meta_title: "Edit Price List",
    feature: "price_lists",
    permModule: "price_list",
    permAction: "edit",
  },
  {
    id: "cust-cat-0",
    path: route.distributionCategories,
    element: <DistributionCategoryList />,
    route: Route,
    meta_title: "Distribution Categories",
  },
  {
    id: "cust-cat-1",
    path: route.addDistributionCategory,
    element: <NewDistributionCategory />,
    route: Route,
    meta_title: "Add Distribution Category",
  },
  {
    id: "cust-cat-2",
    path: route.editDistributionCategory,
    element: <NewDistributionCategory />,
    route: Route,
    meta_title: "Edit Distribution Category",
  },
  {
    id: "cust-sub-cat-0",
    path: route.distributionSubCategories,
    element: <DistributionSubCategoryList />,
    route: Route,
    meta_title: "Distribution Sub Categories",
  },
  {
    id: "cust-sub-cat-1",
    path: route.addDistributionSubCategory,
    element: <NewDistributionSubCategory />,
    route: Route,
    meta_title: "Add Distribution Sub Category",
  },
  {
    id: "cust-sub-cat-2",
    path: route.editDistributionSubCategory,
    element: <NewDistributionSubCategory />,
    route: Route,
    meta_title: "Edit Distribution Sub Category",
  },
  {
    id: "dist-loc-0",
    path: route.distributionLocationList + "/*",
    element: <DistributionLocationList />,
    route: Route,
    meta_title: "Distribution Locations",
    permModule: "locations",
  },
  {
    id: "distributors-list-0",
    path: route.distributors,
    element: <DistributorsList />,
    route: Route,
    meta_title: "Parties",
    permModule: "parties",
  },
  {
    id: "dist-new-0",
    path: route.addNewDistributors,
    element: <AddNewParty />,
    route: Route,
    meta_title: "Add New Party",
    permModule: "parties",
    permAction: "create",
  },
  {
    id: "dist-edit-0",
    path: route.editDistributor,
    element: <AddNewParty />,
    route: Route,
    meta_title: "Edit Party",
    permModule: "parties",
    permAction: "edit",
  },
  {
    id: "party-overview-0",
    path: route.distributorOverview,
    element: <PartyOverview />,
    route: Route,
    meta_title: "Party Overview",
    permModule: "parties",
    permAllowParty: true,
  },
  {
    id: "168b",
    path: route.productCustomField,
    element: <AddCustomField />,
    route: Route,
    meta_title: "Settings - New Custom Field",
    permModule: "settings",
  },
  {
    id: "168c",
    path: route.productCustomFieldEdit,
    element: <EditCustomField />,
    route: Route,
    meta_title: "Settings - Edit Custom Field",
    permModule: "settings",
  },
  {
    id: "168d",
    path: route.customerCustomField,
    element: <AddCustomField />,
    route: Route,
    meta_title: "Settings - New Custom Field",
    permModule: "settings",
  },
  {
    id: "168e",
    path: route.customerCustomFieldEdit,
    element: <EditCustomField />,
    route: Route,
    meta_title: "Settings - Edit Custom Field",
    permModule: "settings",
  },
  {
    id: "168f",
    path: route.invoiceCustomField,
    element: <AddCustomField />,
    route: Route,
    meta_title: "Settings - New Custom Field",
    permModule: "settings",
  },
  {
    id: "168g",
    path: route.invoiceCustomFieldEdit,
    element: <EditCustomField />,
    route: Route,
    meta_title: "Settings - Edit Custom Field",
    permModule: "settings",
  },
  {
    id: "168h",
    path: route.paymentCustomField,
    element: <AddCustomField />,
    route: Route,
    meta_title: "Settings - New Custom Field",
    permModule: "settings",
  },
  {
    id: "168i",
    path: route.paymentCustomFieldEdit,
    element: <EditCustomField />,
    route: Route,
    meta_title: "Settings - Edit Custom Field",
    permModule: "settings",
  },
  {
    id: "169",
    path: route.emailSettings,
    element: <EmailSettings />,
    route: Route,
    meta_title: "Settings - Email",
    permModule: "settings",
  },
  {
    id: "170",
    path: route.smsGateways,
    element: <SmsGateways />,
    route: Route,
    meta_title: "Settings - SMS Gateways",
    permModule: "settings",
  },
  {
    id: "171",
    path: route.gdprCookies,
    element: <GdprCookies />,
    route: Route,
    meta_title: "Settings - GDPR",
    permModule: "settings",
  },
  {
    id: "172",
    path: route.layoutMini,
    element: <DelasDashboard />,
    route: Route,
    meta_title: "Layout Mini",
  },
  {
    id: "173",
    path: route.hoverView,
    element: <DelasDashboard />,
    route: Route,
    meta_title: "Layout Hover view",
  },
  {
    id: "174",
    path: route.hidden,
    element: <DelasDashboard />,
    route: Route,
    meta_title: "Layout Hidden",
  },
  {
    id: "174",
    path: route.fullWidth,
    element: <DelasDashboard />,
    route: Route,
    meta_title: "Layout Full Width",
  },
  {
    id: "175",
    path: route.layoutRtl,
    element: <DelasDashboard />,
    route: Route,
    meta_title: "Layout Rtl",
  },
  {
    id: "176",
    path: route.Dark,
    element: <DelasDashboard />,
    route: Route,
    meta_title: "Layout Dark",
  },
  {
    id: "178",
    path: route.paymentGateways,
    element: <PaymentGateways />,
    route: Route,
    meta_title: "Settings - Payment Gateways",
    permModule: "settings",
  },
  {
    id: "179",
    path: route.bankAccount,
    element: <BankAccounts />,
    route: Route,
    meta_title: "Settings - Bank Account",
    permModule: "settings",
  },
  {
    id: "180",
    path: route.taxRates,
    element: <TaxRates />,
    route: Route,
    meta_title: "Settings - Tax Rates",
    permModule: "settings",
  },
  {
    id: "181",
    path: route.currencies,
    element: <Currencies />,
    route: Route,
    meta_title: "Settings - Currencies",
    permModule: "settings",
  },
  {
    id: "182",
    path: route.sitemap,
    element: <Sitemap />,
    route: Route,
    meta_title: "Settings - Sitemap",
    permModule: "settings",
  },
  {
    id: "183",
    path: route.clearCache,
    element: <ClearCache />,
    route: Route,
    meta_title: "Settings - Clear Cache",
    permModule: "settings",
  },
  {
    id: "184",
    path: route.storage,
    element: <Storage />,
    route: Route,
    meta_title: "Settings - Storage",
    permModule: "settings",
  },
  {
    id: "185",
    path: route.cronjob,
    element: <Cronjob />,
    route: Route,
    meta_title: "Settings - Cronjob",
    permModule: "settings",
  },
  {
    id: "186",
    path: route.banIpAddrress,
    element: <BanIpAddress />,
    route: Route,
    meta_title: "Settings - Ban Ip Address",
    permModule: "settings",
  },
  {
    id: "187",
    path: route.systemBackup,
    element: <SystemBackup />,
    route: Route,
    meta_title: "Settings - System Backup",
    permModule: "settings",
  },
  {
    id: "188",
    path: route.databaseBackup,
    element: <DatabaseBackup />,
    route: Route,
    meta_title: "Settings - Database Backup",
    permModule: "settings",
  },
  {
    id: "189",
    path: route.systemUpdate,
    element: <SystemUpdate />,
    route: Route,
    meta_title: "Settings - System Update",
    permModule: "settings",
  },
  {
    id: "190",
    path: route.notificationbell,
    element: <Notifications />,
    route: Route,
    meta_title: "Notification",
  },
  {
    id: "191",
    path: route.superadminDashboard,
    element: <Dashboard />,
    route: Route,
    meta_title: "Dashboard",
  },
  {
    id: "192",
    path: route.superadminCompany,
    element: <Company />,
    route: Route,
    meta_title: "Companies",
  },
  {
    id: "193",
    path: route.superadminSubscription,
    element: <Subscription />,
    route: Route,
    meta_title: "Subscription",
  },
  {
    id: "194",
    path: route.superadminPackagelist,
    element: <Packages />,
    route: Route,
    meta_title: "Packages",
  },
  {
    id: "195",
    path: route.superadminDomain,
    element: <Domain />,
    route: Route,
    meta_title: "Domains",
  },
  {
    id: "196",
    path: route.superadminPurchaseTransaction,
    element: <PurchaseTransaction />,
    route: Route,
    meta_title: "Purchase Transaction",
  },
  {
    id: "197",
    path: route.mapleaflet,
    element: <MapsLeaflet />,
    route: Route,
    meta_title: "Leaflet Maps",
  },
  {
    id: "198",
    path: route.formSelect,
    element: <FormSelect2 />,
    route: Route,
    meta_title: "Form Select",
  },
  {
    id: "199",
    path: route.sweetalert,
    element: <UiSweetAlerts />,
    route: Route,
    meta_title: "Sweet Alert",
  },
];

export const authRoutes = [
  {
    id: "403",
    path: route.error403,
    element: <Error403 />,
    route: Route,
    meta_title: "Access Denied",
  },
  {
    id: "1",
    path: route.login,
    element: <Login />,
    route: Route,
    meta_title: "Login",
  },
  {
    id: "2",
    path: route.register,
    element: <Register />,
    route: Route,
    meta_title: "Register",
  },
  {
    id: "3",
    path: route.resetPassword,
    element: <ResetPassword />,
    route: Route,
    meta_title: "Reset Password",
  },
  {
    id: "4",
    path: route.forgotPassword,
    element: <ForgotPassword />,
    route: Route,
    meta_title: "Forgot Password",
  },
  {
    id: "5",
    path: route.emailVerification,
    element: <EmailVerification />,
    route: Route,
    meta_title: "Email Verification",
  },
  {
    id: "6",
    path: route.twoStepVerification,
    element: <TwoStepVerification />,
    route: Route,
    meta_title: "TwoStep Verification",
  },
  {
    id: "7",
    path: route.lockScreen,
    element: <LockScreen />,
    route: Route,
    meta_title: "Lock Screen",
  },
  {
    id: "8",
    path: route.error404,
    element: <Error404 />,
    route: Route,
    meta_title: "Error404",
  },
  {
    id: "9",
    path: route.error500,
    element: <Error500 />,
    route: Route,
    meta_title: "Error500",
  },
  {
    id: "10",
    path: route.comingSoon,
    element: <ComingSoon />,
    route: Route,
    meta_title: "Coming Soon",
  },
  {
    id: "11",
    path: route.underMaintenance,
    element: <UnderMaintenance />,
    route: Route,
    title: "Under Maintenance",
  },
];
