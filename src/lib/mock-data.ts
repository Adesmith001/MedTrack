import type { ChildProfile, ReminderRecord, UserProfile, UserRole, VaccineAdministration } from '../types/domain'
import { addDays, toIsoDate } from './date'

function buildAdministrationRecord(
  id: string,
  birthDate: string,
  offsetDays: number,
  vaccineCode: string,
  vaccineName: string,
  doseLabel: string,
  facilityName: string,
  administeredBy: string,
  notes?: string,
): VaccineAdministration {
  const scheduledDate = toIsoDate(addDays(birthDate, offsetDays))

  return {
    id,
    vaccineCode,
    vaccineName,
    doseLabel,
    scheduledDate,
    completedDate: scheduledDate,
    administeredBy,
    facilityName,
    notes,
  }
}

const today = new Date()

const babyAvaBirth = toIsoDate(addDays(today, -264))
const babyDanielBirth = toIsoDate(addDays(today, -79))
const babyNoraBirth = toIsoDate(addDays(today, -401))
const babyJonahBirth = toIsoDate(addDays(today, -18))

export const demoUsersByRole: Record<UserRole, UserProfile> = {
  parent: {
    id: 'parent-001',
    name: 'Miriam Okafor',
    email: 'miriam.okafor@medtrack.demo',
    phone: '+234 803 555 1021',
    role: 'parent',
    facilityName: 'Ikeja Family Clinic',
  },
  staff: {
    id: 'staff-001',
    name: 'Nurse Tunde Bello',
    email: 'tunde.bello@medtrack.demo',
    phone: '+234 802 121 4470',
    role: 'staff',
    facilityName: 'Ikeja Family Clinic',
  },
  admin: {
    id: 'admin-001',
    name: 'Amaka Eze',
    email: 'amaka.eze@medtrack.demo',
    phone: '+234 809 772 0031',
    role: 'admin',
    facilityName: 'Lagos North District',
  },
}

export const demoChildren: ChildProfile[] = [
  {
    id: 'child-ava',
    parentId: 'parent-001',
    fullName: 'Ava Okafor',
    birthDate: babyAvaBirth,
    sex: 'female',
    guardianName: 'Miriam Okafor',
    phone: '+234 803 555 1021',
    address: '8 Oduduwa Crescent, Ikeja',
    facilityId: 'facility-ikeja',
    facilityName: 'Ikeja Family Clinic',
    nextAppointment: toIsoDate(addDays(today, 6)),
    lastUpdated: toIsoDate(addDays(today, -1)),
    immunizations: [
      buildAdministrationRecord('ava-bcg', babyAvaBirth, 0, 'BCG', 'BCG', 'Birth', 'Ikeja Family Clinic', 'Nurse Tunde Bello'),
      buildAdministrationRecord('ava-hepb', babyAvaBirth, 0, 'HepB', 'Hepatitis B', 'Birth', 'Ikeja Family Clinic', 'Nurse Tunde Bello'),
      buildAdministrationRecord('ava-opv1', babyAvaBirth, 42, 'OPV', 'Oral Polio Vaccine', 'Dose 1', 'Ikeja Family Clinic', 'Nurse Tunde Bello'),
      buildAdministrationRecord('ava-penta1', babyAvaBirth, 42, 'Penta', 'Pentavalent', 'Dose 1', 'Ikeja Family Clinic', 'Nurse Tunde Bello'),
      buildAdministrationRecord('ava-pcv1', babyAvaBirth, 42, 'PCV', 'Pneumococcal', 'Dose 1', 'Ikeja Family Clinic', 'Nurse Tunde Bello'),
      buildAdministrationRecord('ava-penta2', babyAvaBirth, 70, 'Penta', 'Pentavalent', 'Dose 2', 'Ikeja Family Clinic', 'Nurse Tunde Bello'),
      buildAdministrationRecord('ava-pcv2', babyAvaBirth, 70, 'PCV', 'Pneumococcal', 'Dose 2', 'Ikeja Family Clinic', 'Nurse Tunde Bello'),
      buildAdministrationRecord('ava-penta3', babyAvaBirth, 98, 'Penta', 'Pentavalent', 'Dose 3', 'Ikeja Family Clinic', 'Nurse Tunde Bello'),
    ],
  },
  {
    id: 'child-daniel',
    parentId: 'parent-001',
    fullName: 'Daniel Okafor',
    birthDate: babyDanielBirth,
    sex: 'male',
    guardianName: 'Miriam Okafor',
    phone: '+234 803 555 1021',
    address: '8 Oduduwa Crescent, Ikeja',
    facilityId: 'facility-ikeja',
    facilityName: 'Ikeja Family Clinic',
    nextAppointment: toIsoDate(addDays(today, 3)),
    lastUpdated: toIsoDate(addDays(today, -2)),
    immunizations: [
      buildAdministrationRecord('daniel-bcg', babyDanielBirth, 0, 'BCG', 'BCG', 'Birth', 'Ikeja Family Clinic', 'Nurse Tunde Bello'),
      buildAdministrationRecord('daniel-hepb', babyDanielBirth, 0, 'HepB', 'Hepatitis B', 'Birth', 'Ikeja Family Clinic', 'Nurse Tunde Bello'),
      buildAdministrationRecord('daniel-opv0', babyDanielBirth, 0, 'OPV', 'Oral Polio Vaccine', 'Birth', 'Ikeja Family Clinic', 'Nurse Tunde Bello'),
    ],
  },
  {
    id: 'child-nora',
    parentId: 'parent-002',
    fullName: 'Nora Adeyemi',
    birthDate: babyNoraBirth,
    sex: 'female',
    guardianName: 'Kelvin Adeyemi',
    phone: '+234 806 440 7840',
    address: '18 Alausa Road, Ikeja',
    facilityId: 'facility-ikeja',
    facilityName: 'Ikeja Family Clinic',
    nextAppointment: toIsoDate(addDays(today, -4)),
    lastUpdated: toIsoDate(addDays(today, -5)),
    immunizations: [
      buildAdministrationRecord('nora-bcg', babyNoraBirth, 0, 'BCG', 'BCG', 'Birth', 'Ikeja Family Clinic', 'Nurse Tunde Bello'),
      buildAdministrationRecord('nora-hepb', babyNoraBirth, 0, 'HepB', 'Hepatitis B', 'Birth', 'Ikeja Family Clinic', 'Nurse Tunde Bello'),
      buildAdministrationRecord('nora-opv1', babyNoraBirth, 42, 'OPV', 'Oral Polio Vaccine', 'Dose 1', 'Ikeja Family Clinic', 'Nurse Tunde Bello'),
      buildAdministrationRecord('nora-penta1', babyNoraBirth, 42, 'Penta', 'Pentavalent', 'Dose 1', 'Ikeja Family Clinic', 'Nurse Tunde Bello'),
      buildAdministrationRecord('nora-pcv1', babyNoraBirth, 42, 'PCV', 'Pneumococcal', 'Dose 1', 'Ikeja Family Clinic', 'Nurse Tunde Bello'),
      buildAdministrationRecord('nora-penta2', babyNoraBirth, 70, 'Penta', 'Pentavalent', 'Dose 2', 'Ikeja Family Clinic', 'Nurse Tunde Bello'),
      buildAdministrationRecord('nora-pcv2', babyNoraBirth, 70, 'PCV', 'Pneumococcal', 'Dose 2', 'Ikeja Family Clinic', 'Nurse Tunde Bello'),
      buildAdministrationRecord('nora-measles', babyNoraBirth, 270, 'Measles', 'Measles', 'Dose 1', 'Ikeja Family Clinic', 'Nurse Tunde Bello'),
    ],
  },
  {
    id: 'child-jonah',
    parentId: 'parent-003',
    fullName: 'Jonah Ibrahim',
    birthDate: babyJonahBirth,
    sex: 'male',
    guardianName: 'Fatima Ibrahim',
    phone: '+234 807 114 9920',
    address: '22 Opebi Street, Lagos',
    facilityId: 'facility-maryland',
    facilityName: 'Maryland Community Hospital',
    nextAppointment: toIsoDate(addDays(today, 9)),
    lastUpdated: toIsoDate(addDays(today, -1)),
    immunizations: [
      buildAdministrationRecord('jonah-bcg', babyJonahBirth, 0, 'BCG', 'BCG', 'Birth', 'Maryland Community Hospital', 'Nurse Halima Sule'),
    ],
  },
]

export const demoReminders: ReminderRecord[] = [
  {
    id: 'reminder-001',
    childId: 'child-daniel',
    childName: 'Daniel Okafor',
    guardianName: 'Miriam Okafor',
    target: 'miriam.okafor@medtrack.demo',
    channel: 'email',
    status: 'queued',
    scheduledFor: new Date(addDays(today, 1)).toISOString(),
    message: 'Pentavalent Dose 1 is due this week. Please confirm your clinic visit.',
  },
  {
    id: 'reminder-002',
    childId: 'child-ava',
    childName: 'Ava Okafor',
    guardianName: 'Miriam Okafor',
    target: '+234 803 555 1021',
    channel: 'sms',
    status: 'sent',
    scheduledFor: new Date(addDays(today, -1)).toISOString(),
    sentAt: new Date(addDays(today, -1)).toISOString(),
    message: 'Measles Dose 1 is due soon. Arrive with your immunization card.',
  },
  {
    id: 'reminder-003',
    childId: 'child-nora',
    childName: 'Nora Adeyemi',
    guardianName: 'Kelvin Adeyemi',
    target: '+234 806 440 7840',
    channel: 'sms',
    status: 'failed',
    scheduledFor: new Date(addDays(today, -2)).toISOString(),
    message: 'Follow-up reminder failed. Parent phone needs verification.',
  },
  {
    id: 'reminder-004',
    childId: 'child-jonah',
    childName: 'Jonah Ibrahim',
    guardianName: 'Fatima Ibrahim',
    target: 'fatima.ibrahim@medtrack.demo',
    channel: 'email',
    status: 'queued',
    scheduledFor: new Date(addDays(today, 2)).toISOString(),
    message: 'Birth-dose follow-up is scheduled for next week.',
  },
]
