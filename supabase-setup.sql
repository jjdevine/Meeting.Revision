create table if not exists meeting_prep_state (
  user_id uuid references auth.users(id) on delete cascade primary key,
  progress_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table meeting_prep_state enable row level security;

create policy "Users can read own state"
  on meeting_prep_state for select using (auth.uid() = user_id);

create policy "Users can insert own state"
  on meeting_prep_state for insert with check (auth.uid() = user_id);

create policy "Users can update own state"
  on meeting_prep_state for update using (auth.uid() = user_id);
