try:
    import boto3
    from app.core.config import get_settings

    def get_s3_client():
        settings = get_settings()
        return boto3.client(
            "s3",
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            region_name=settings.s3_region,
        )

    def upload_temp_file(data: bytes, key: str) -> str:
        settings = get_settings()
        client = get_s3_client()
        client.put_object(Bucket=settings.s3_bucket_temp, Key=key, Body=data)
        url = client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.s3_bucket_temp, "Key": key},
            ExpiresIn=3600,
        )
        return url

    def copy_file_with_new_name(temp_key: str, new_filename: str, user_id: int) -> str:
        settings = get_settings()
        client = get_s3_client()
        new_key = f"users/{user_id}/{new_filename}"
        client.copy_object(
            Bucket=settings.s3_bucket_prod,
            CopySource={"Bucket": settings.s3_bucket_temp, "Key": temp_key},
            Key=new_key,
        )
        client.delete_object(Bucket=settings.s3_bucket_temp, Key=temp_key)
        url = client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.s3_bucket_prod, "Key": new_key},
            ExpiresIn=86400,
        )
        return url

except ImportError:
    from app.utils.s3_dev import upload_temp_file, copy_file_with_new_name
