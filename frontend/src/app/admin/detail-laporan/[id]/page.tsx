"use client";

import dynamic from "next/dynamic";

const DetailLaporanAdminClient = dynamic(
  () => import("../../../../components/DetailLaporanAdminClient"),
  { ssr: false }
);

export default function AdminLaporanDetailPage() {
  return <DetailLaporanAdminClient />;
}
