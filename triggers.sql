--This trigger function (push_main_queue_insert_trigger) is called after an insert operation on the push_main_queue table. 
--It checks the push_type of the newly inserted record and inserts a corresponding record into either push_restapi or push_rabbitmq table.
--Make sure to run these SQL scripts using a PostgreSQL client or a tool like pgAdmin. After creating these triggers, 
--whenever you insert a record into the push_main_queue table with a specific push_type, 
--it will automatically insert a corresponding record into the appropriate table (push_restapi or push_rabbitmq).

-- Trigger function for handling inserts into push_main_queue
CREATE OR REPLACE FUNCTION push_main_queue_insert_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.push_type = 'restapi' THEN
    INSERT INTO public.push_restapi (push_queue_id)
    VALUES (NEW.push_queue_id);
  ELSIF NEW.push_type = 'rabbitmq' THEN
    INSERT INTO public.push_rabbitmq (push_queue_id)
    VALUES (NEW.push_queue_id);
  END IF;

  -- Update push_main_queue with handshake_state and handshaked_at
  UPDATE public.push_main_queue
  SET handshake_state = true,
      handshaked_at = CURRENT_TIMESTAMP
  WHERE push_queue_id = NEW.push_queue_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to execute the function on INSERT
CREATE TRIGGER push_main_queue_insert
AFTER INSERT ON public.push_main_queue
FOR EACH ROW
EXECUTE FUNCTION push_main_queue_insert_trigger();
