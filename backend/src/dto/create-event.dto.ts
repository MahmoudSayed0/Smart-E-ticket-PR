import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsInt,
  Min,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '../domain/event-type.enum';

export class CreateEventDto {
  @ApiProperty({ example: 'Coldplay Live', description: 'Event name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'An unforgettable night with Coldplay', description: 'Event description' })
  @IsString()
  @MaxLength(500)
  description!: string;

  @ApiProperty({ example: 'Cairo International Stadium', description: 'Event venue' })
  @IsString()
  @IsNotEmpty()
  venue!: string;

  @ApiProperty({ example: '2026-12-31T20:00:00.000Z', description: 'Event date (ISO-8601)' })
  @IsDateString()
  eventDate!: string;

  @ApiProperty({ example: 500, description: 'Total ticket capacity (min 1)' })
  @IsInt()
  @Min(1)
  totalCapacity!: number;

  @ApiProperty({
    enum: EventType,
    example: EventType.CONCERT,
    description: 'Type of event; determines which polymorphic subclass is created by EventFactory',
  })
  @IsEnum(EventType)
  type!: EventType;

  @ApiPropertyOptional({ example: 'Coldplay', description: 'Artist name (required for CONCERT)' })
  @IsOptional()
  @IsString()
  artist?: string;

  @ApiPropertyOptional({
    example: 'Dr. Jane Doe',
    description: 'Speaker name (required for CONFERENCE)',
  })
  @IsOptional()
  @IsString()
  speaker?: string;

  @ApiPropertyOptional({
    example: 'Al Ahly vs Zamalek',
    description: 'Teams (required for SPORTS)',
  })
  @IsOptional()
  @IsString()
  teams?: string;
}
