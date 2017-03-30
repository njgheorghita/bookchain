var Book = artifacts.require("../contracts/Book.sol");

contract('Book', function(accounts) {
  it('should be created with a name', function() {
    var book = Book.new("Moby Dick", "Van Dyke");
    return book.then(function(instance) {
      return instance.name.call();
    }).then(function(name) {
      assert.equal(web3.toAscii(name).substring(0, 9), "Moby Dick");
    });
  });

  it('should be available by default', function() {
    var book = Book.new("Moby Dick", "Van Dyke");
    return book.then(function(instance) {
      return instance.isAvailable.call();
    }).then(function(isAvailable) {
      assert.isTrue(isAvailable,'This should be true.');
    });
  });

});

// Can I write tests without using promises?
