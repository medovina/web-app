import { expect } from 'chai';
import { createCASLoginUrl, getTicketFromUrl } from '../../src/helpers/cas';

describe.only('helpers', () => {
  describe('CAS authentication helper', () => {
    it('must create the URL of the CAS system', () => {
      expect(createCASLoginUrl('a')).to.equal(
        'https://idp.cuni.cz/cas?service=a'
      );
      expect(createCASLoginUrl('https://www.abc.def?auth')).to.equal(
        'https://idp.cuni.cz/cas?service=https://www.abc.def?auth'
      );
    });

    it('must extract the ticket from the URL correctly', () => {
      const ticket = 'ST-1194-466qwXdmJA7mqcCrannr-idp.cuni.cz';
      expect(getTicketFromUrl('abc')).to.equal(null);
      expect(getTicketFromUrl(`?ticket=${ticket}`)).to.equal(ticket);
      expect(getTicketFromUrl(`&ticket=${ticket}`)).to.equal(ticket);
      expect(getTicketFromUrl(`&ticket=${ticket}&xalsdkjalsd`)).to.equal(
        ticket
      );
      expect(
        getTicketFromUrl(`&ticket=${ticket}&xalsdkjalsd?ticket=asdasd`)
      ).to.equal(ticket);
      expect(
        getTicketFromUrl(`https://localhost:8000/?ticket=${ticket}`)
      ).to.equal(ticket);
      expect(getTicketFromUrl(`https://www.abc.xy/?ticket=${ticket}`)).to.equal(
        ticket
      );
      expect(
        getTicketFromUrl(`https://www.abc.xy/?ticket=${ticket}&ticket=asdasd`)
      ).to.equal(ticket);
      expect(
        getTicketFromUrl(
          `https://www.abc.xy/ticket?bucket=abc&ticket=${ticket}`
        )
      ).to.equal(ticket);
    });
  });
});
