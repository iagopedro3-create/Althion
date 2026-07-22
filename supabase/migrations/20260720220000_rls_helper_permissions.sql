-- RLS policies execute as the querying role. Keep the private schema hidden,
-- but allow authenticated users to execute only the helpers referenced by policies.
grant execute on function app_private.current_profile_id() to authenticated;
grant execute on function app_private.is_platform_admin() to authenticated;
grant execute on function app_private.has_org_access(uuid) to authenticated;
grant execute on function app_private.can_access_clinic(uuid, uuid) to authenticated;
grant execute on function app_private.can_manage_memberships(uuid) to authenticated;
grant execute on function app_private.can_read_memberships(uuid) to authenticated;
grant execute on function app_private.can_read_audit(uuid) to authenticated;
grant execute on function app_private.can_read_radar(uuid, uuid) to authenticated;
grant execute on function app_private.can_write_radar(uuid, uuid) to authenticated;
grant execute on function app_private.can_read_portal(uuid, uuid) to authenticated;
grant execute on function app_private.can_read_portal_request(uuid, uuid, uuid) to authenticated;
grant execute on function app_private.can_access_cockpit(uuid, uuid) to authenticated;
grant execute on function app_private.can_read_recovery(uuid, uuid) to authenticated;
grant execute on function app_private.can_read_quality(uuid, uuid) to authenticated;
grant execute on function app_private.can_read_clinical_flags(uuid, uuid) to authenticated;
grant execute on function app_private.can_manage_google_ads(uuid, uuid) to authenticated;
