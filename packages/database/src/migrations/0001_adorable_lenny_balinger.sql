-- Custom migration file for adding zero databases and the lambda trigger --

-- Trigger after user message chunk is inserted
CREATE TRIGGER trigger_user_message_chunk_insert
AFTER INSERT
ON message_chunks
FOR EACH ROW
EXECUTE PROCEDURE public.rds_lambda_trigger();
