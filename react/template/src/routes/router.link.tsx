import { Navigate, Route } from "react-router";
import { all_routes } from "./all_routes";
import Login from "../feature-module/Authentication/login/login";
import Contacts from "../feature-module/Pages/crm-module/contacts/contacts";
import UiAccordion from "../feature-module/Pages/ui-module/base-ui/uiAccordion";
import UiAlerts from "../feature-module/Pages/ui-module/base-ui/uiAlerts";
import UiAvatar from "../feature-module/Pages/ui-module/base-ui/uiAvatar";
import UiBadges from "../feature-module/Pages/ui-module/base-ui/uiBadges";
import UiBreadcrumb from "../feature-module/Pages/ui-module/base-ui/uiBreadcrumb";
import UiButtons from "../feature-module/Pages/ui-module/base-ui/uiButtons";
import UiButtonsGroup from "../feature-module/Pages/ui-module/base-ui/uiButtonsGroup";
import UiCards from "../feature-module/Pages/ui-module/base-ui/uiCards";
import UiCarousel from "../feature-module/Pages/ui-module/base-ui/uiCarousel";
import UiCollapse from "../feature-module/Pages/ui-module/base-ui/uiCollapse";
import UiDropdowns from "../feature-module/Pages/ui-module/base-ui/uiDropdowns";
import UiGrid from "../feature-module/Pages/ui-module/base-ui/uiGrid";
import UiRatio from "../feature-module/Pages/ui-module/base-ui/uiRatio";
import UiImages from "../feature-module/Pages/ui-module/base-ui/uiImages";
import UiLinks from "../feature-module/Pages/ui-module/base-ui/uiLinks";
import UiListGroup from "../feature-module/Pages/ui-module/base-ui/uiListGroup";
import UiModals from "../feature-module/Pages/ui-module/base-ui/uiModals";
import UiOffcanvas from "../feature-module/Pages/ui-module/base-ui/uiOffcanvas";
import UiPagination from "../feature-module/Pages/ui-module/base-ui/uiPagination";
import UiPlaceholders from "../feature-module/Pages/ui-module/base-ui/uiPlaceholders";
import UiPopovers from "../feature-module/Pages/ui-module/base-ui/uiPopovers";
import UiProgress from "../feature-module/Pages/ui-module/base-ui/uiProgress";
import UiSpinner from "../feature-module/Pages/ui-module/base-ui/uiSpinner";
import UiNavTabs from "../feature-module/Pages/ui-module/base-ui/uiNavTabs";
import UiToasts from "../feature-module/Pages/ui-module/base-ui/uiToasts";
import UiTooltips from "../feature-module/Pages/ui-module/base-ui/uiTooltips";
import UiTypography from "../feature-module/Pages/ui-module/base-ui/uiTypography";
import UiUtilities from "../feature-module/Pages/ui-module/base-ui/uiUtilities";
import UiDragula from "../feature-module/Pages/ui-module/ui-advance/dragula/dragula";
import UiClipBoard from "../feature-module/Pages/ui-module/ui-advance/uiClipboard";
import UiRangeSlides from "../feature-module/Pages/ui-module/ui-advance/uiRangeslider";
import UiLightboxes from "../feature-module/Pages/ui-module/ui-advance/uiLightbox";
import UiRating from "../feature-module/Pages/ui-module/ui-advance/uiRating";
import UiScrollbar from "../feature-module/Pages/ui-module/ui-advance/uiScrollbar";
import UiScrollspy from "../feature-module/Pages/ui-module/base-ui/uiScrollspy";
import FormBasicInputs from "../feature-module/Pages/ui-module/forms/form-elements/formBasicInputs";
import FormCheckboxRadios from "../feature-module/Pages/ui-module/forms/form-elements/formCheckboxRadios";
import FormInputGroups from "../feature-module/Pages/ui-module/forms/form-elements/formInputGroups";
import FormGridGutters from "../feature-module/Pages/ui-module/forms/form-elements/formGridGutters";
import FormMask from "../feature-module/Pages/ui-module/forms/input-masks/inputMasks";
import FormFileupload from "../feature-module/Pages/ui-module/forms/form-elements/formFileupload";
import FormHorizontal from "../feature-module/Pages/ui-module/forms/form-layouts/formHorizontal";
import FormVertical from "../feature-module/Pages/ui-module/forms/form-layouts/formVertical";
import FormFloatingLabels from "../feature-module/Pages/ui-module/forms/form-layouts/formFloatingLabels";
import FormValidation from "../feature-module/Pages/ui-module/forms/form-validation/formValidation";

import FormWizard from "../feature-module/Pages/ui-module/forms/form-wizard/formWizard";
import FormPickers from "../feature-module/Pages/ui-module/forms/form-pickers/formPickers";
import TablesBasic from "../feature-module/Pages/ui-module/table/tables-basic";
import DataTables from "../feature-module/Pages/ui-module/table/data-tables";
import ChartApex from "../feature-module/Pages/ui-module/charts/apexcharts";
import IconBootstrap from "../feature-module/Pages/ui-module/icons/iconBootstrap";
import IconFlag from "../feature-module/Pages/ui-module/icons/iconFlag";
import IconFontawesome from "../feature-module/Pages/ui-module/icons/iconFontawesome";
import IconIonic from "../feature-module/Pages/ui-module/icons/iconIonic";
import IconMaterial from "../feature-module/Pages/ui-module/icons/iconMaterial";
import IconPe7 from "../feature-module/Pages/ui-module/icons/iconPe7";
import IconRemix from "../feature-module/Pages/ui-module/icons/iconRemix";
import IconTabler from "../feature-module/Pages/ui-module/icons/iconTabler";
import IconThemify from "../feature-module/Pages/ui-module/icons/iconThemify";
import IconTypicon from "../feature-module/Pages/ui-module/icons/iconTypicon";
import IconWeather from "../feature-module/Pages/ui-module/icons/iconWeather";
import DelasDashboard from "../feature-module/Pages/dashboard/deals-dashboard/delasDashboard";
import ContactsList from "../feature-module/Pages/crm-module/contacts/contactsList";
import Chat from "../feature-module/Pages/application-module/chat/chat";
import VideoCall from "../feature-module/Pages/application-module/chat/calls/videoCall";
import AudioCall from "../feature-module/Pages/application-module/chat/calls/audioCall";
import CallHistory from "../feature-module/Pages/application-module/chat/calls/callHistory";
import Calender from "../feature-module/Pages/application-module/calendar/calendar";
import Email from "../feature-module/Pages/application-module/email/email";
import EmailReply from "../feature-module/Pages/application-module/email/emailReply";
import Todo from "../feature-module/Pages/application-module/todo/todo";
import TodoList from "../feature-module/Pages/application-module/todo/todoList";
import Notes from "../feature-module/Pages/application-module/notes/notes";
import FileManager from "../feature-module/Pages/application-module/file-manager/fileManager";
import SocialFeed from "../feature-module/Pages/application-module/social-feed/socialFeed";
import KanbanView from "../feature-module/Pages/application-module/kanban-view/kanbanView";
import Invoice from "../feature-module/Pages/application-module/invoice/invoice";
import AddInoivce from "../feature-module/Pages/application-module/invoice/add-invoice/addInoivce";
import EditInoivce from "../feature-module/Pages/application-module/invoice/edit-invoice/editInoivce";
import InvoiceDetails from "../feature-module/Pages/application-module/invoice/invoiceDetails";
import Register from "../feature-module/Authentication/register/register";
import ResetPassword from "../feature-module/Authentication/reset-password/resetPassword";
import ForgotPassword from "../feature-module/Authentication/forgot-password/forgotPassword";
import EmailVerification from "../feature-module/Authentication/email-verification/emailVerification";
import TwoStepVerification from "../feature-module/Authentication/two-step-verification/twoStepVerification";
import LockScreen from "../feature-module/Authentication/lock-screen/lockScreen";
import Error404 from "../feature-module/Authentication/error-404/error404";
import Error500 from "../feature-module/Authentication/error-500/error500";
import BlankPage from "../feature-module/Authentication/blank-page/blankPage";
import ComingSoon from "../feature-module/Authentication/coming-soon/comingSoon";
import UnderMaintenance from "../feature-module/Authentication/under-maintenance/underMaintenance";
import LeadsDashboard from "../feature-module/Pages/dashboard/leads-dashboard/leadsDashboard";
import ProjectDashboard from "../feature-module/Pages/dashboard/project-dashboard/projectDashboard";
import ContactsDetails from "../feature-module/Pages/crm-module/contacts/contactsDetails";
import CompaniesGrid from "../feature-module/Pages/crm-module/companies/companiesGrid";
import CompaniesList from "../feature-module/Pages/crm-module/companies/companiesList";
import CompaniesDetails from "../feature-module/Pages/crm-module/companies/companiesDetails";
import DealsGrid from "../feature-module/Pages/crm-module/deals/dealsGrid";
import DealsList from "../feature-module/Pages/crm-module/deals/dealsList";
import DealsDetails from "../feature-module/Pages/crm-module/deals/dealsDetails";
import Leads from "../feature-module/Pages/crm-module/leads/leads";
import LeadsList from "../feature-module/Pages/crm-module/leads/leadsList";
import LeadsDetails from "../feature-module/Pages/crm-module/leads/leadsDetails";
import Pipeline from "../feature-module/Pages/crm-module/pipeline/pipeline";
import Campaign from "../feature-module/Pages/crm-module/campaign/campaign";
import CampaignComplete from "../feature-module/Pages/crm-module/campaign/campaignComplete";
import CampaignArchieve from "../feature-module/Pages/crm-module/campaign/campaignArchieve";
import ProjectsGrid from "../feature-module/Pages/crm-module/projects/projectsGrid";
import ProjectsList from "../feature-module/Pages/crm-module/projects/projectsList";
import Tasks from "../feature-module/Pages/crm-module/tasks/tasks";
import ProjectDetails from "../feature-module/Pages/crm-module/projects/projectDetails";
import TasksImportant from "../feature-module/Pages/crm-module/tasks/tasksImportant";
import Taskscompleted from "../feature-module/Pages/crm-module/tasks/tasksCompleted";
import Proposals from "../feature-module/Pages/crm-module/proposals/proposals";
import ProposalList from "../feature-module/Pages/crm-module/proposals/proposalList";
import Contracts from "../feature-module/Pages/crm-module/contracts/contracts";
import ContractsList from "../feature-module/Pages/crm-module/contracts/contractsList";
import Estimations from "../feature-module/Pages/crm-module/estimations/estimations";
import EstimationsList from "../feature-module/Pages/crm-module/estimations/estimationsList";
import InvoicesGrid from "../feature-module/Pages/crm-module/invoices/invoicesGrid";
import InvoicesList from "../feature-module/Pages/crm-module/invoices/invoicesList";
import Payments from "../feature-module/Pages/crm-module/payments/payments";
import Analytics from "../feature-module/Pages/crm-module/analytics/analytics";
import Activities from "../feature-module/Pages/crm-module/activities/activities";
import LeadReports from "../feature-module/Pages/reports/lead-reports/leadReports";
import DealReports from "../feature-module/Pages/reports/deal-reports/dealReports";
import ContactReports from "../feature-module/Pages/reports/contact-reports/contactReports";
import CompanyReports from "../feature-module/Pages/reports/company-reports/companyReports";
import ProjectReports from "../feature-module/Pages/reports/project-reports/projectReports";
import TaskReports from "../feature-module/Pages/reports/task-reports/taskReports";
import Sources from "../feature-module/Pages/crm-settings/sources/sources";
import LostReason from "../feature-module/Pages/crm-settings/lost-reason/lostReason";
import ActivityCalls from "../feature-module/Pages/crm-module/activities/activity-calls";
import ActivityMails from "../feature-module/Pages/crm-module/activities/activity-mail";
import ActivityTasks from "../feature-module/Pages/crm-module/activities/activity-task";
import ActivityMeetings from "../feature-module/Pages/crm-module/activities/activity-meeting";
import ContactStage from "../feature-module/Pages/crm-settings/contact-stage/contactStage";
import Industry from "../feature-module/Pages/crm-settings/industry/industry";
import Calls from "../feature-module/Pages/crm-settings/calls/calls";
import ManageUsers from "../feature-module/Pages/user-management/manage-users/manageUsers";
import RolesPermissions from "../feature-module/Pages/user-management/roles-permissions/rolesPermissions";
import Permission from "../feature-module/Pages/user-management/permission/permission";
import DeleteRequest from "../feature-module/Pages/user-management/delete-request/deleteRequest";
import MembershipPlans from "../feature-module/Pages/membership/membership-plans/membershipPlans";
import MembershipAddons from "../feature-module/Pages/membership/membership-addons/membershipAddons";
import MembershipTransactions from "../feature-module/Pages/membership/membership-transactions/membershipTransactions";
import Page from "../feature-module/Pages/content/page";
import AddPage from "../feature-module/Pages/content/addPage";
import EditPage from "../feature-module/Pages/content/editPage";
import Blogs from "../feature-module/Pages/content/blogs/blogs";
import Addblog from "../feature-module/Pages/content/blogs/addblog";
import Editblog from "../feature-module/Pages/content/blogs/editblog";
import BlogDetails from "../feature-module/Pages/content/blogs/blogDetails";
import BlogCategories from "../feature-module/Pages/content/blogs/blogCategories";
import BlogComments from "../feature-module/Pages/content/blogs/blogComments";
import BlogTags from "../feature-module/Pages/content/blogs/blogTags";
import Countries from "../feature-module/Pages/content/location/countries";
import States from "../feature-module/Pages/content/location/states";
import Cities from "../feature-module/Pages/content/location/cities";
import Testimonials from "../feature-module/Pages/content/testimonials";
import Faq from "../feature-module/Pages/content/faq";
import ContactMessages from "../feature-module/Pages/support/contact-messages/contactMessages";
import Tickets from "../feature-module/Pages/support/tickets/tickets";
import TicketDetails from "../feature-module/Pages/support/tickets/ticketDetails";
import ProfileSettings from "../feature-module/Pages/settings/general-settings/profileSettings";
import SecuritySettings from "../feature-module/Pages/settings/general-settings/securitySettings";
import NotificationsSettings from "../feature-module/Pages/settings/general-settings/notificationsSettings";
import ConnectedApps from "../feature-module/Pages/settings/general-settings/connectedApps";
import CompanySettings from "../feature-module/Pages/settings/website-settings/companySettings";
import LocalizationSettings from "../feature-module/Pages/settings/website-settings/localizationSettings";
import PrefixesSettings from "../feature-module/Pages/settings/website-settings/prefixesSettings";
import PreferenceSettings from "../feature-module/Pages/settings/website-settings/preferenceSettings";
import AppearanceSettings from "../feature-module/Pages/settings/website-settings/appearanceSettings";
import LanguageSettings from "../feature-module/Pages/settings/website-settings/languageSettings";
import InvoiceSettings from "../feature-module/Pages/settings/app-settings/invoiceSettings";
import PrintersSettings from "../feature-module/Pages/settings/app-settings/printersSettings";
import CustomFieldsSetting from "../feature-module/Pages/settings/app-settings/customFieldsSetting";
import EmailSettings from "../feature-module/Pages/settings/system-settings/emailSettings";
import SmsGateways from "../feature-module/Pages/settings/system-settings/smsGateways";
import GdprCookies from "../feature-module/Pages/settings/system-settings/gdprCookies";
import PaymentGateways from "../feature-module/Pages/settings/financial-settings/paymentGateways";
import BankAccounts from "../feature-module/Pages/settings/financial-settings/bankAccounts";
import TaxRates from "../feature-module/Pages/settings/financial-settings/taxRates";
import Currencies from "../feature-module/Pages/settings/financial-settings/currencies";
import Sitemap from "../feature-module/Pages/settings/other-settings/sitemap";
import ClearCache from "../feature-module/Pages/settings/other-settings/clearCache";
import Storage from "../feature-module/Pages/settings/other-settings/storage";
import Cronjob from "../feature-module/Pages/settings/other-settings/cronjob";
import BanIpAddress from "../feature-module/Pages/settings/other-settings/banIpAddress";
import SystemBackup from "../feature-module/Pages/settings/other-settings/systemBackup";
import DatabaseBackup from "../feature-module/Pages/settings/other-settings/databaseBackup";
import SystemUpdate from "../feature-module/Pages/settings/other-settings/systemUpdate";
import Notifications from "../feature-module/Pages/notifications/notifications";
import Dashboard from "../feature-module/Pages/super-admin/dashboard";
import Company from "../feature-module/Pages/super-admin/company";
import Subscription from "../feature-module/Pages/super-admin/subscription";
import Packages from "../feature-module/Pages/super-admin/packages";
import Domain from "../feature-module/Pages/super-admin/domain";
import PurchaseTransaction from "../feature-module/Pages/super-admin/purchaseTransaction";
import MapsLeaflet from "../feature-module/Pages/ui-module/map/leaflet";
import FormSelect2 from "../feature-module/Pages/ui-module/forms/form-select2/formSelect2";
import UiSweetAlerts from "../feature-module/Pages/ui-module/ui-advance/uiSweetAlerts";

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
    id: "113",
    path: route.payments,
    element: <Payments />,
    route: Route,
    meta_title: "Payments",
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
  },
  {
    id: "132",
    path: route.rolesPermissions,
    element: <RolesPermissions />,
    route: Route,
    meta_title: "Roles & Permissions",
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
  },
  {
    id: "158",
    path: route.notification,
    element: <NotificationsSettings />,
    route: Route,
    meta_title: "Settings - Notification Settings",
  },
  {
    id: "159",
    path: route.connectedApps,
    element: <ConnectedApps />,
    route: Route,
    meta_title: "Settings - Connected Apps",
  },
  {
    id: "160",
    path: route.companySettings,
    element: <CompanySettings />,
    route: Route,
    meta_title: "Settings - Company",
  },
  {
    id: "161",
    path: route.localization,
    element: <LocalizationSettings />,
    route: Route,
    meta_title: "Settings - Localization",
  },
  {
    id: "162",
    path: route.prefixes,
    element: <PrefixesSettings />,
    route: Route,
    meta_title: "Settings - Prefixes",
  },
  {
    id: "163",
    path: route.preference,
    element: <PreferenceSettings />,
    route: Route,
    meta_title: "Settings - Preference",
  },
  {
    id: "164",
    path: route.appearance,
    element: <AppearanceSettings />,
    route: Route,
    meta_title: "Settings - Appearance",
  },
  {
    id: "165",
    path: route.languageWeb,
    element: <LanguageSettings />,
    route: Route,
    meta_title: "Settings - Language",
  },
  {
    id: "166",
    path: route.invoiceSettings,
    element: <InvoiceSettings />,
    route: Route,
    meta_title: "Settings - Invoice",
  },
  {
    id: "167",
    path: route.printers,
    element: <PrintersSettings />,
    route: Route,
    meta_title: "Settings - Printers",
  },
  {
    id: "168",
    path: route.customFields,
    element: <CustomFieldsSetting />,
    route: Route,
    meta_title: "Settings - Custom Fields",
  },
  {
    id: "169",
    path: route.emailSettings,
    element: <EmailSettings />,
    route: Route,
    meta_title: "Settings - Email",
  },
  {
    id: "170",
    path: route.smsGateways,
    element: <SmsGateways />,
    route: Route,
    meta_title: "Settings - SMS Gateways",
  },
  {
    id: "171",
    path: route.gdprCookies,
    element: <GdprCookies />,
    route: Route,
    meta_title: "Settings - GDPR",
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
  },
  {
    id: "179",
    path: route.bankAccount,
    element: <BankAccounts />,
    route: Route,
    meta_title: "Settings - Bank Account",
  },
  {
    id: "180",
    path: route.taxRates,
    element: <TaxRates />,
    route: Route,
    meta_title: "Settings - Tax Rates",
  },
  {
    id: "181",
    path: route.currencies,
    element: <Currencies />,
    route: Route,
    meta_title: "Settings - Currencies",
  },
  {
    id: "182",
    path: route.sitemap,
    element: <Sitemap />,
    route: Route,
    meta_title: "Settings - Sitemap",
  },
  {
    id: "183",
    path: route.clearCache,
    element: <ClearCache />,
    route: Route,
    meta_title: "Settings - Clear Cache",
  },
  {
    id: "184",
    path: route.storage,
    element: <Storage />,
    route: Route,
    meta_title: "Settings - Storage",
  },
  {
    id: "185",
    path: route.cronjob,
    element: <Cronjob />,
    route: Route,
    meta_title: "Settings - Cronjob",
  },
  {
    id: "186",
    path: route.banIpAddrress,
    element: <BanIpAddress />,
    route: Route,
    meta_title: "Settings - Ban Ip Address",
  },
  {
    id: "187",
    path: route.systemBackup,
    element: <SystemBackup />,
    route: Route,
    meta_title: "Settings - System Backup",
  },
  {
    id: "188",
    path: route.databaseBackup,
    element: <DatabaseBackup />,
    route: Route,
    meta_title: "Settings - Database Backup",
  },
  {
    id: "189",
    path: route.systemUpdate,
    element: <SystemUpdate />,
    route: Route,
    meta_title: "Settings - System Update",
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
