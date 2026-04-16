import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventService } from './event.service';
import { EventFactory } from '../factory/event.factory';
import { IEventRepository } from '../repository/event.repository.interface';
import { ConcertEvent } from '../domain/concert-event.entity';
import { EventType } from '../domain/event-type.enum';
import { CreateEventDto } from '../dto/create-event.dto';

describe('EventService', () => {
  let service: EventService;
  let mockRepo: jest.Mocked<IEventRepository>;
  let factory: EventFactory;

  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const validDto: CreateEventDto = {
    name: 'Test Concert',
    description: 'A test',
    venue: 'Venue',
    eventDate: futureDate,
    totalCapacity: 10,
    type: EventType.CONCERT,
    artist: 'Test Artist',
  };

  beforeEach(() => {
    mockRepo = {
      save: jest.fn((e) => e),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
    };
    factory = new EventFactory();
    service = new EventService(mockRepo, factory);
  });

  describe('createEvent', () => {
    it('creates and saves a valid event', () => {
      const event = service.createEvent(validDto);

      expect(event).toBeInstanceOf(ConcertEvent);
      expect(mockRepo.save).toHaveBeenCalledWith(event);
    });

    it('throws BadRequestException if event date is in the past', () => {
      const pastDto = { ...validDto, eventDate: '2020-01-01T00:00:00.000Z' };
      expect(() => service.createEvent(pastDto)).toThrow(BadRequestException);
      expect(mockRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('getAllEvents', () => {
    it('returns all events from the repository', () => {
      const events = [
        new ConcertEvent('1', 'A', 'd', 'v', new Date('2030-01-01'), 10, 'X'),
      ];
      mockRepo.findAll.mockReturnValue(events);

      expect(service.getAllEvents()).toBe(events);
    });
  });

  describe('getEventById', () => {
    it('returns the event when found', () => {
      const event = new ConcertEvent('1', 'A', 'd', 'v', new Date('2030-01-01'), 10, 'X');
      mockRepo.findById.mockReturnValue(event);

      expect(service.getEventById('1')).toBe(event);
    });

    it('throws NotFoundException when the event does not exist', () => {
      mockRepo.findById.mockReturnValue(null);
      expect(() => service.getEventById('missing')).toThrow(NotFoundException);
    });
  });
});
