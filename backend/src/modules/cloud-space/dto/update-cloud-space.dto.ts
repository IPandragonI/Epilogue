import { PartialType } from '@nestjs/mapped-types';
import { CreateCloudSpaceDto } from './create-cloud-space.dto';

export class UpdateCloudSpaceDto extends PartialType(CreateCloudSpaceDto) {}
