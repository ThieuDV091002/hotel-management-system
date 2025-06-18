import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

export default function Welcome() {
  return (
    <div>
      <PageMeta
        title="Quick Stay Admin Dashboard"
        description="This is Quick Stay Admin Dashboard"
      />
      <PageBreadcrumb pageTitle="" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[630px] text-center">
          <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Welcome to Quick Stay Admin Dashboard
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            Start managing your hotel using dashboards, grids, and panels.  
            Please explore the dashboard and other functional pages to begin your tasks.
          </p>
        </div>
      </div>
    </div>
  );
}
