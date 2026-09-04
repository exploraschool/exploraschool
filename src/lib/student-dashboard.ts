import { getDisciplineDisplayName, type MainDisciplineId, type ModalityId } from "@/data/disciplines";
import { getProductBySlug, type ProductId } from "@/data/products";
import { ACCOUNT_MEETING_POINT_EN, ACCOUNT_MEETING_POINT_ES } from "@/data/student-account";
import { TIME_SLOTS, type TimeSlotId } from "@/lib/booking-config";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { listStudentBookingLeads } from "@/lib/link-bookings";
import {
  effectiveInstructorName,
  effectiveInstructorSlug,
  type StoredBookingItem,
  type StoredLead,
} from "@/lib/leads";
import {
  earnedBadges,
  parseProgressReport,
  PROGRESS_REPORTS_COLLECTION,
  totalProgressHours,
  type ProgressReport,
} from "@/lib/progress-reports";
import type { StudentSession } from "@/lib/student-auth";
import { getStudentProfile } from "@/lib/student-user-store";
import type { StudentProfile } from "@/lib/student-users";
import { bookingStatusWhatsappText, newLessonWhatsappText, whatsappHref } from "@/lib/whatsapp";
import { ensureTipsMigratedFromStaffTips, listStudentTips, type StudentTip } from "@/lib/student-tips";

export type DashboardLesson = {
  leadId: string;
  itemIndex: number;
  status: string;
  productTitle: string;
  date: string;
  timeSlotId: string;
  timeSlotLabel: string;
  discipline: string;
  disciplineLabel: string;
  instructorSlug: string;
  instructorName: string;
  hours: number;
  reportId: string | null;
  whatsappUrl?: string;
};

export type StudentDashboard = {
  requested: DashboardLesson[];
  confirmed: DashboardLesson[];
  history: DashboardLesson[];
  reports: ProgressReport[];
  tips: StudentTip[];
  hours: number;
  badges: { id: string; label: string }[];
  meetingPoint: string;
  profile: StudentProfile | null;
  name: string;
  newLessonUrl: string;
  lastInstructorName: string;
};

function lessonFromItem(
  leadId: string,
  lead: StoredLead,
  item: StoredBookingItem,
  index: number,
  locale: string,
  reportIds: Set<string>,
): DashboardLesson {
  const product = getProductBySlug(item.productId as ProductId);
  const productTitle = product ? (locale === "en" ? product.titleEn : product.titleEs) : item.productId;
  const disciplineLabel =
    getDisciplineDisplayName(
      locale,
      item.discipline as MainDisciplineId | undefined,
      item.modality as ModalityId | undefined,
    ) || item.discipline;
  const slot = TIME_SLOTS[item.timeSlotId as TimeSlotId];
  const reportId = `${leadId}_${index}`;

  return {
    leadId,
    itemIndex: index,
    status: lead.status,
    productTitle,
    date: item.date,
    timeSlotId: item.timeSlotId,
    timeSlotLabel: item.timeSlotLabel,
    discipline: item.discipline,
    disciplineLabel,
    instructorSlug: effectiveInstructorSlug(item),
    instructorName: effectiveInstructorName(item),
    hours: slot?.hours ?? product?.hours ?? 0,
    reportId: reportIds.has(reportId) ? reportId : null,
  };
}

export async function loadStudentDashboard(session: StudentSession): Promise<StudentDashboard> {
  const profile = await getStudentProfile(session.uid);
  const locale = profile?.locale === "en" ? "en" : "es";
  const meetingPoint = locale === "en" ? ACCOUNT_MEETING_POINT_EN : ACCOUNT_MEETING_POINT_ES;
  const empty: StudentDashboard = {
    requested: [],
    confirmed: [],
    history: [],
    reports: [],
    tips: [],
    hours: 0,
    badges: [],
    meetingPoint,
    profile,
    name: profile?.displayName || session.name || session.email,
    newLessonUrl: whatsappHref(
      newLessonWhatsappText({ locale, name: session.name || session.email, instructorName: "Explora" }),
    ),
    lastInstructorName: "",
  };

  if (!isAdminConfigured()) return empty;
  const db = getAdminDb();
  if (!db) return empty;

  const leads = await listStudentBookingLeads(db, { uid: session.uid, email: session.email });
  const reportsSnap = await db
    .collection(PROGRESS_REPORTS_COLLECTION)
    .where("studentUid", "==", session.uid)
    .get()
    .catch(async () => {
      const all = await db.collection(PROGRESS_REPORTS_COLLECTION).get();
      return {
        docs: all.docs.filter(
          (doc) => doc.data().studentUid === session.uid || doc.data().studentEmail === session.email,
        ),
      };
    });

  const reports = reportsSnap.docs.map((doc) => parseProgressReport(doc.id, doc.data() as Record<string, unknown>));
  const reportIds = new Set<string>();
  for (const report of reports) {
    reportIds.add(report.id);
    reportIds.add(`${report.leadId}_${report.itemIndex}`);
  }
  const tips = profile
    ? await ensureTipsMigratedFromStaffTips(session.uid, profile.staffTips)
    : await listStudentTips(session.uid, 20);
  const requested: DashboardLesson[] = [];
  const confirmed: DashboardLesson[] = [];
  const history: DashboardLesson[] = [];

  for (const { id, data } of leads) {
    for (const [index, item] of (data.bookingItems ?? []).entries()) {
      const lesson = lessonFromItem(id, data, item, index, locale, reportIds);
      if (data.status === "pending") requested.push(lesson);
      else if (data.status === "confirmed") confirmed.push(lesson);
      else history.push(lesson);
    }
  }

  const name = profile?.displayName || session.name || session.email;
  const lastInstructorName = [...confirmed, ...history].map((item) => item.instructorName).find(Boolean) || "";

  return {
    requested: requested.map((lesson) => ({
      ...lesson,
      whatsappUrl: whatsappHref(
        bookingStatusWhatsappText({
          locale,
          name,
          dates: `${lesson.date} ${lesson.timeSlotLabel}`,
          discipline: lesson.disciplineLabel,
        }),
      ),
    })),
    confirmed,
    history,
    reports,
    tips,
    hours: totalProgressHours(reports) || confirmed.concat(history).reduce((sum, item) => sum + item.hours, 0),
    badges: earnedBadges(reports, locale),
    meetingPoint,
    profile,
    name,
    newLessonUrl: whatsappHref(
      newLessonWhatsappText({ locale, name, instructorName: lastInstructorName || "Explora" }),
    ),
    lastInstructorName,
  };
}
