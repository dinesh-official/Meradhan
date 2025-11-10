// "use client";

// import { Card, CardContent } from "@/components/ui/card";
// import CardPagination from "@/global/elements/table/CardPagination";
// import ActivityLogsCardHeaderFilters from "./_components/ActivityLogsCardHeaderFilters";
// import AuditLogsTable from "./_components/AuditLogsTable";
// import { useAuditLogsApi } from "./hooks/useAuditLogsApi";

// function CrmActivityLogsView() {
//   const { fetchLogs, state } = useAuditLogsApi();
//   const isShowPagination = () => {
//     return (
//       (fetchLogs.data?.data.responseData.data.length || 0) > 0 &&
//       fetchLogs.data?.data.responseData.meta.totalPages != 1 &&
//       !fetchLogs.isPending
//     );
//   };
//   return (
//     <Card>
//       <ActivityLogsCardHeaderFilters
//         onActivityTypeChange={state.setType}
//         onSearchChange={state.setSearch}
//         searchValue={state.search}
//         selectedActivityType={state.type}
//         setUser={state.setUser}
//         user={state.user}
//       />
//       <CardContent>
//         <AuditLogsTable
//           data={fetchLogs.data?.data.responseData.data || []}
//           isLoading={fetchLogs.isLoading}
//         />
//       </CardContent>
//       {isShowPagination() && (
//         <CardPagination
//           onClick={(newPage) => state.setPage(newPage)}
//           page={state.page}
//           totalPages={fetchLogs.data?.data.responseData.meta.totalPages || 1}
//         />
//       )}
//     </Card>
//   );
// }

// export default CrmActivityLogsView;
